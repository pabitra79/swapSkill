import session from 'express-session';
import RedisStore from "connect-redis";
import { redisClient } from './redisConfig';

export const sessionConfig = session({
  store: new RedisStore({ 
    client: redisClient,
    prefix: 'sess:' 
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax' 
  }
});