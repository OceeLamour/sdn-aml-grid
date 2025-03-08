import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import Entity from '../models/Entity';
import logger from '../utils/logger';
import { cacheData, getCachedData, isCacheValid } from '../utils/cache';

// URLs for OFAC XML data
const OFAC_SDN_URL = 'https://www.treasury.gov/ofac/downloads/sdn.xml';
const OFAC_CONSOLIDATED_URL = 'https://www.treasury.gov/ofac/downloads/consolidated/consolidated.xml';

/**
 * Parse OFAC XML data into structured format
 */
const parseOfacXml = (xmlData: string) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name, jpath) => {
      const arrayElements = [
        'sdnEntry', 'program', 'id', 'aka', 'address',
        'nationality', 'citizenship', 'dateOfBirthItem', 'placeOfBirthItem'
      ];
      return arrayElements.includes(name);
    }
  });
  
  return parser.parse(xmlData);
};

/**
 * Convert OFAC XML data to our Entity model format
 */
const convertToEntityModel = (rawData: any): Partial<Document>[] => {
  const entities: Partial<Document>[] = [];
  
  // Process SDN entries
  if (rawData.sdnList && rawData.sdnList.sdnEntry) {
    for (const entry of rawData.sdnList.sdnEntry) {
      try {
        // Determine entity type
        let type: string = 'Other';
        
        if (entry.sdnType === 'Individual') {
          type = 'Individual';
        } else if (['Entity', 'Business', 'Organization'].includes(entry.sdnType)) {
          type = 'Organization';
        } else if (entry.sdnType === 'Vessel') {
          type = 'Vessel';
        } else if (entry.sdnType === 'Aircraft') {
          type = 'Aircraft';
        }
        
        // Process identifiers
        const identifiers = entry.id ? entry.id.map((id: any) => ({
          type: id.idType,
          value: id.idNumber,
          country: id.idCountry,
          issueDate: id.idIssueDate ? new Date(id.idIssueDate) : undefined,
          expiryDate: id.expirationDate ? new Date(id.expirationDate) : undefined
        })) : [];
        
        // Process AKAs (alternate names)
        const alternateNames = entry.aka ? entry.aka
          .filter((aka: any) => aka.categoryType !== 'Primary Name')
          .map((aka: any) => aka.lastName ? `${aka.firstName || ''} ${aka.lastName}`.trim() : aka.entireName)
          : [];
        
        // Process addresses
        const addresses = entry.address ? entry.address.map((addr: any) => ({
          street: addr.address1,
          city: addr.city,
          state: addr.stateOrProvince,
          country: addr.country,
          postalCode: addr.postalCode
        })) : [];
        
        // Create entity object
        const entity: Partial<Document> = {
          name: entry.lastName ? `${entry.firstName || ''} ${entry.lastName}`.trim() : entry.entireName,
          type: type as any,
          alternateNames,
          identifiers,
          addresses,
          dateOfBirth: entry.dateOfBirthItem?.[0]?.dateOfBirth ? new Date(entry.dateOfBirthItem[0].dateOfBirth) : undefined,
          placeOfBirth: entry.placeOfBirthItem?.[0]?.placeOfBirth,
          nationality: entry.nationality?.map((nat: any) => nat.country),
          citizenships: entry.citizenship?.map((cit: any) => cit.country),
          sanctions: [
            {
              listSource: 'OFAC',
              listName: 'SDN',
              entryId: entry.uid,
              entryUrl: `https://sanctionssearch.ofac.treas.gov/Details.aspx?id=${entry.uid}`,
              dateAdded: new Date(),
              status: 'Active',
              program: entry.program?.map((p: any) => p.value),
              reasonForSanction: entry.remarks
            }
          ],
          riskScore: calculateRiskScore(entry),
          lastUpdated: new Date(),
          createdAt: new Date()
        };
        
        entities.push(entity);
      } catch (error) {
        logger.error(`Error processing OFAC entity ${entry.uid || 'unknown'}:`, error);
      }
    }
  }
  
  return entities;
};

/**
 * Calculate a simple risk score based on the entity data
 * This is a placeholder for more sophisticated AI-based scoring
 */
const calculateRiskScore = (entry: any): number => {
  let score = 50; // Base score
  
  // Increase score based on program type
  if (entry.program) {
    for (const program of entry.program) {
      if (program.value.includes('WEAPONS')) score += 20;
      if (program.value.includes('TERROR')) score += 20;
      if (program.value.includes('CYBER')) score += 15;
      if (program.value.includes('NARCO')) score += 15;
      if (program.value.includes('IRAN') || program.value.includes('DPRK') || program.value.includes('SYRIA')) score += 10;
    }
  }
  
  // Cap score at 100
  return Math.min(score, 100);
};

/**
 * Fetch and process OFAC sanctions list
 */
export const scrapeOfacSanctionsList = async (): Promise<void> => {
  try {
    logger.info('Starting OFAC sanctions list scrape');
    
    // Check if cache is valid
    const cacheKey = 'ofac-sdn-data';
    if (isCacheValid(cacheKey, 24 * 60 * 60)) { // 24 hours cache
      logger.info('Using cached OFAC sanctions data');
      return;
    }
    
    // Fetch XML data
    logger.info(`Fetching OFAC sanctions data from ${OFAC_SDN_URL}`);
    const response = await axios.get(OFAC_SDN_URL);
    
    // Parse XML data
    const parsedData = parseOfacXml(response.data);
    
    // Convert to our data model
    const entities = convertToEntityModel(parsedData);
    logger.info(`Processed ${entities.length} entities from OFAC sanctions list`);
    
    // Bulk upsert to database
    let successCount = 0;
    let errorCount = 0;
    
    for (const entity of entities) {
      try {
        // Try to find existing entity by list source and entry ID
        const existingEntity = await Entity.findOne({
          'sanctions.listSource': 'OFAC',
          'sanctions.entryId': entity.sanctions[0].entryId
        });
        
        if (existingEntity) {
          // Update existing entity
          Object.assign(existingEntity, entity);
          existingEntity.lastUpdated = new Date();
          await existingEntity.save();
        } else {
          // Create new entity
          await Entity.create(entity);
        }
        
        successCount++;
      } catch (error) {
        logger.error(`Error saving entity ${entity.name}:`, error);
        errorCount++;
      }
    }
    
    logger.info(`OFAC scrape completed. Success: ${successCount}, Errors: ${errorCount}`);
    
    // Cache the data
    cacheData(cacheKey, { timestamp: Date.now(), count: entities.length });
    
  } catch (error) {
    logger.error('Error scraping OFAC sanctions list:', error);
    throw error;
  }
};

export default {
  scrapeOfacSanctionsList
};
