import session from 'express-session';
// Removed RedisStore and redisClient imports

export const sessionConfig = session({
  // Removed Redis store - will use default memory store
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