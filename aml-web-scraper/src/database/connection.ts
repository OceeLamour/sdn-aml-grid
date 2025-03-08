import mongoose from 'mongoose';
import logger from '../utils/logger';

// Database connection URL
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aml-web-scraper';

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB database');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB database');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
};

// Setup MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
