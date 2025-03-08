import Redis from 'redis';
import logger from './logger';

// Create Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = Redis.createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
  }
})();

/**
 * Store data in Redis cache
 * @param key The cache key
 * @param data The data to cache
 * @param ttl Time-to-live in seconds (optional, defaults to 1 hour)
 */
export const cacheData = async (key: string, data: any, ttl = 3600): Promise<void> => {
  try {
    const serializedData = JSON.stringify(data);
    await redisClient.set(key, serializedData, { EX: ttl });
    logger.debug(`Data cached successfully with key: ${key}`);
  } catch (error) {
    logger.error(`Error caching data with key ${key}:`, error);
  }
};

/**
 * Retrieve data from Redis cache
 * @param key The cache key
 * @returns The cached data, or null if not found
 */
export const getCachedData = async (key: string): Promise<any | null> => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
};

/**
 * Check if cached data is still valid (exists and not expired)
 * @param key The cache key
 * @param maxAgeSecs Maximum age in seconds for the cache to be considered valid
 * @returns true if cache is valid, false otherwise
 */
export const isCacheValid = async (key: string, maxAgeSecs = 3600): Promise<boolean> => {
  try {
    const cachedData = await getCachedData(key);
    if (!cachedData || !cachedData.timestamp) return false;
    
    const cacheAge = (Date.now() - cachedData.timestamp) / 1000; // Convert to seconds
    return cacheAge < maxAgeSecs;
  } catch (error) {
    logger.error(`Error checking cache validity for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete a key from Redis cache
 * @param key The cache key to delete
 */
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache invalidated for key: ${key}`);
  } catch (error) {
    logger.error(`Error invalidating cache for key ${key}:`, error);
  }
};

/**
 * Get Time-To-Live (TTL) for a key in seconds
 * @param key The cache key
 * @returns The TTL in seconds, or -2 if the key doesn't exist, -1 if no expiry
 */
export const getCacheTTL = async (key: string): Promise<number> => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error(`Error getting TTL for key ${key}:`, error);
    return -2;
  }
};

export default {
  cacheData,
  getCachedData,
  isCacheValid,
  invalidateCache,
  getCacheTTL,
  redisClient
};
