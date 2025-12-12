import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err:any) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log(' Connected to Redis');
});

// Connect to Redis
const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log(' Redis connected successfully');
  } catch (error) {
    console.error(' Redis connection failed:', error);
    // process.exit(1);
  }
};

export { redisClient, connectRedis };