// // middleware/rateLimit.ts
// import { redisClient } from '../config/redisConfig';

// export const rateLimiter = async (userId: string, limit: number = 10, windowMs: number = 60000) => {
//   const key = `rate_limit:${userId}`;
//   const current = await redisClient.incr(key);
  
//   if (current === 1) {
//     await redisClient.expire(key, windowMs / 1000);
//   }
  
//   return current <= limit;
// };