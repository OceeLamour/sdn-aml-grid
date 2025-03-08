import cron from 'node-cron';
import ofacScraper from '../scrapers/ofac-scraper';
import logger from '../utils/logger';

/**
 * Schedule all periodic tasks for the AML Web Scraper
 */
export const setupScheduledTasks = (): void => {
  logger.info('Setting up scheduled tasks');
  
  // OFAC Sanctions List - Every day at 02:00 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running scheduled OFAC sanctions list scrape');
    try {
      await ofacScraper.scrapeOfacSanctionsList();
      logger.info('Scheduled OFAC sanctions list scrape completed successfully');
    } catch (error) {
      logger.error('Error in scheduled OFAC sanctions list scrape:', error);
    }
  });

  // Additional scrapers can be scheduled here
  // Example: EU Sanctions List - Every day at 03:00 AM
  // cron.schedule('0 3 * * *', async () => {
  //   logger.info('Running scheduled EU sanctions list scrape');
  //   try {
  //     await euScraper.scrapeEuSanctionsList();
  //     logger.info('Scheduled EU sanctions list scrape completed successfully');
  //   } catch (error) {
  //     logger.error('Error in scheduled EU sanctions list scrape:', error);
  //   }
  // });
  
  // Example: UN Sanctions List - Every day at 04:00 AM
  // cron.schedule('0 4 * * *', async () => {
  //   logger.info('Running scheduled UN sanctions list scrape');
  //   try {
  //     await unScraper.scrapeUnSanctionsList();
  //     logger.info('Scheduled UN sanctions list scrape completed successfully');
  //   } catch (error) {
  //     logger.error('Error in scheduled UN sanctions list scrape:', error);
  //   }
  // });
  
  // Example: UK Sanctions List - Every day at 05:00 AM
  // cron.schedule('0 5 * * *', async () => {
  //   logger.info('Running scheduled UK sanctions list scrape');
  //   try {
  //     await ukScraper.scrapeUkSanctionsList();
  //     logger.info('Scheduled UK sanctions list scrape completed successfully');
  //   } catch (error) {
  //     logger.error('Error in scheduled UK sanctions list scrape:', error);
  //   }
  // });
  
  // Initial runs on startup (wait 30 seconds to allow system to initialize)
  setTimeout(async () => {
    logger.info('Running initial sanctions list scrapes');
    
    try {
      await ofacScraper.scrapeOfacSanctionsList();
      logger.info('Initial OFAC sanctions list scrape completed successfully');
    } catch (error) {
      logger.error('Error in initial OFAC sanctions list scrape:', error);
    }
    
    // Add other initial scrapes here
  }, 30000);
  
  logger.info('All scheduled tasks have been set up');
};

export default {
  setupScheduledTasks
};
