// utils/chatCache.ts
import { redisClient } from '../config/redisConfig';

export const cacheChatMessages = async (swapId: string, messages: any[]) => {
  const key = `chat:${swapId}`;
  await redisClient.setEx(key, 3600, JSON.stringify(messages)); // Cache for 1 hour
};

export const getCachedChatMessages = async (swapId: string) => {
  const key = `chat:${swapId}`;
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
};