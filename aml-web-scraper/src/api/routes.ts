import { Express, Request, Response } from 'express';
import Entity from '../models/Entity';
import ofacScraper from '../scrapers/ofac-scraper';
import logger from '../utils/logger';
import { isCacheValid, getCachedData, cacheData } from '../utils/cache';

/**
 * Set up all API routes for the application
 */
export const setupRoutes = (app: Express): void => {
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    return res.status(200).json({
      status: 'ok',
      message: 'AML Web Scraper is running',
      timestamp: new Date().toISOString()
    });
  });

  // Get all entities with pagination and filtering
  app.get('/api/entities', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      
      // Build filter object from query parameters
      const filter: any = {};
      
      if (req.query.name) {
        filter.$text = { $search: req.query.name as string };
      }
      
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      if (req.query.listSource) {
        filter['sanctions.listSource'] = req.query.listSource;
      }
      
      if (req.query.status) {
        filter['sanctions.status'] = req.query.status;
      }
      
      if (req.query.minRiskScore) {
        filter.riskScore = { $gte: parseInt(req.query.minRiskScore as string) };
      }
      
      // Check cache for this specific query
      const cacheKey = `entities:${JSON.stringify({ page, limit, filter })}`;
      const isCached = await isCacheValid(cacheKey, 5 * 60); // 5 minutes cache
      
      if (isCached) {
        const cachedData = await getCachedData(cacheKey);
        logger.debug('Serving entities from cache');
        return res.status(200).json(cachedData);
      }
      
      // Execute the query
      const entities = await Entity.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ lastUpdated: -1 });
      
      const total = await Entity.countDocuments(filter);
      
      const result = {
        data: entities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
      
      // Cache the results
      await cacheData(cacheKey, result, 5 * 60); // 5 minutes cache
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error getting entities:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve entities'
      });
    }
  });

  // Get entity by ID
  app.get('/api/entities/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check cache
      const cacheKey = `entity:${id}`;
      const isCached = await isCacheValid(cacheKey, 5 * 60); // 5 minutes cache
      
      if (isCached) {
        const cachedData = await getCachedData(cacheKey);
        logger.debug(`Serving entity ${id} from cache`);
        return res.status(200).json(cachedData);
      }
      
      const entity = await Entity.findById(id);
      
      if (!entity) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Entity not found'
        });
      }
      
      // Cache the result
      await cacheData(cacheKey, entity, 5 * 60); // 5 minutes cache
      
      return res.status(200).json(entity);
    } catch (error) {
      logger.error(`Error getting entity ${req.params.id}:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve entity'
      });
    }
  });

  // Search entities by name (with fuzzy matching)
  app.get('/api/search', async (req: Request, res: Response) => {
    try {
      const { query, limit = 20 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'Query parameter is required'
        });
      }
      
      // Check cache
      const cacheKey = `search:${query}:${limit}`;
      const isCached = await isCacheValid(cacheKey, 5 * 60); // 5 minutes cache
      
      if (isCached) {
        const cachedData = await getCachedData(cacheKey);
        logger.debug(`Serving search results for "${query}" from cache`);
        return res.status(200).json(cachedData);
      }
      
      // Perform text search with MongoDB
      const entities = await Entity.find(
        { $text: { $search: query as string } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(parseInt(limit as string));
      
      // Cache the results
      await cacheData(cacheKey, entities, 5 * 60); // 5 minutes cache
      
      return res.status(200).json(entities);
    } catch (error) {
      logger.error(`Error searching entities:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to search entities'
      });
    }
  });

  // Get entity relationships
  app.get('/api/entities/:id/relationships', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check cache
      const cacheKey = `entity:${id}:relationships`;
      const isCached = await isCacheValid(cacheKey, 5 * 60); // 5 minutes cache
      
      if (isCached) {
        const cachedData = await getCachedData(cacheKey);
        logger.debug(`Serving relationship data for entity ${id} from cache`);
        return res.status(200).json(cachedData);
      }
      
      // Find the entity
      const entity = await Entity.findById(id);
      
      if (!entity) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Entity not found'
        });
      }
      
      // Find directly related entities
      const directRelationships = await Promise.all(
        (entity.relationships || []).map(async (rel) => {
          const relatedEntity = await Entity.findById(rel.relatedEntityId);
          return {
            id: rel.relatedEntityId,
            name: relatedEntity?.name || 'Unknown Entity',
            type: relatedEntity?.type || 'Unknown',
            relationType: rel.relationType,
            relationDescription: rel.relationDescription,
            riskScore: relatedEntity?.riskScore || 0
          };
        })
      );
      
      // Find entities that have a relationship with this entity
      const reverseRelationships = await Entity.find(
        { 'relationships.relatedEntityId': entity._id }
      ).select('_id name type relationships riskScore');
      
      const formattedReverseRelationships = reverseRelationships.map(revEntity => {
        const relationship = revEntity.relationships?.find(
          r => r.relatedEntityId.toString() === id
        );
        
        return {
          id: revEntity._id,
          name: revEntity.name,
          type: revEntity.type,
          relationType: relationship?.relationType || 'Unknown',
          relationDescription: relationship?.relationDescription || undefined,
          riskScore: revEntity.riskScore || 0
        };
      });
      
      const result = {
        entity: {
          id: entity._id,
          name: entity.name,
          type: entity.type,
          riskScore: entity.riskScore || 0
        },
        relationships: [
          ...directRelationships,
          ...formattedReverseRelationships
        ]
      };
      
      // Cache the results
      await cacheData(cacheKey, result, 5 * 60); // 5 minutes cache
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error(`Error getting entity relationships for ${req.params.id}:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve entity relationships'
      });
    }
  });

  // Screen entities against sanctions lists
  app.post('/api/screen', async (req: Request, res: Response) => {
    try {
      const { entities } = req.body;
      
      if (!entities || !Array.isArray(entities)) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'Request body must include an array of entities to screen'
        });
      }
      
      const results = await Promise.all(
        entities.map(async (entity: any) => {
          // Check if any field matches exactly
          const exactMatches = await Entity.find({
            $or: [
              { name: entity.name },
              { alternateNames: entity.name }
            ]
          });
          
          // If no exact matches, perform a text search
          let fuzzyMatches: any[] = [];
          if (exactMatches.length === 0 && entity.name) {
            fuzzyMatches = await Entity.find(
              { $text: { $search: entity.name } },
              { score: { $meta: "textScore" } }
            )
            .sort({ score: { $meta: "textScore" } })
            .limit(5);
          }
          
          const matches = [...exactMatches, ...fuzzyMatches];
          
          return {
            query: entity,
            matches: matches.map(match => ({
              id: match._id,
              name: match.name,
              type: match.type,
              riskScore: match.riskScore || 0,
              sanctions: match.sanctions.map((s: any) => ({
                listSource: s.listSource,
                listName: s.listName,
                status: s.status
              })),
              exactMatch: exactMatches.some(em => em._id.equals(match._id))
            })),
            matchCount: matches.length
          };
        })
      );
      
      return res.status(200).json({
        results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error screening entities:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to screen entities'
      });
    }
  });

  // Trigger manual scrape (admin only)
  app.post('/api/admin/scrape', async (req: Request, res: Response) => {
    try {
      // This should have authentication middleware in production
      // Currently simplified for the example
      
      const { source } = req.body;
      
      if (source === 'ofac' || !source) {
        // Start OFAC scrape
        logger.info('Triggering manual OFAC scrape');
        
        // Start scraping asynchronously
        ofacScraper.scrapeOfacSanctionsList()
          .then(() => logger.info('Manual OFAC scrape completed'))
          .catch(err => logger.error('Error in manual OFAC scrape:', err));
        
        return res.status(202).json({
          message: 'OFAC scrape started',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid source. Available sources: ofac'
      });
    } catch (error) {
      logger.error('Error triggering manual scrape:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to trigger scrape'
      });
    }
  });

  // Get a summary of entities in the database
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      // Check cache
      const cacheKey = 'stats';
      const isCached = await isCacheValid(cacheKey, 15 * 60); // 15 minutes cache
      
      if (isCached) {
        const cachedData = await getCachedData(cacheKey);
        logger.debug('Serving stats from cache');
        return res.status(200).json(cachedData);
      }
      
      const totalEntities = await Entity.countDocuments();
      
      const listSourceCounts = await Entity.aggregate([
        { $unwind: '$sanctions' },
        { $group: { _id: '$sanctions.listSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const entityTypeCounts = await Entity.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const riskDistribution = await Entity.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$riskScore', 25] }, then: 'low' },
                  { case: { $lt: ['$riskScore', 50] }, then: 'medium-low' },
                  { case: { $lt: ['$riskScore', 75] }, then: 'medium-high' },
                  { case: { $gte: ['$riskScore', 75] }, then: 'high' }
                ],
                default: 'unknown'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      const lastUpdate = await Entity.findOne().sort({ lastUpdated: -1 }).select('lastUpdated');
      
      const stats = {
        totalEntities,
        listSourceCounts,
        entityTypeCounts,
        riskDistribution,
        lastUpdate: lastUpdate?.lastUpdated || null,
        timestamp: new Date().toISOString()
      };
      
      // Cache the results
      await cacheData(cacheKey, stats, 15 * 60); // 15 minutes cache
      
      return res.status(200).json(stats);
    } catch (error) {
      logger.error('Error getting stats:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve stats'
      });
    }
  });
};

export default { setupRoutes };
