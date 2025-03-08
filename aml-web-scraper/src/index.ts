import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { setupRoutes } from './api/routes';
import { connectToDatabase } from './database/connection';
import { setupScheduledTasks } from './tasks/scheduler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Setup API routes
setupRoutes(app);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Start scheduled tasks
    setupScheduledTasks();
    
    // Start listening for requests
    app.listen(PORT, () => {
      logger.info(`AML Web Scraper running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

export default app;
