// app/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { SessionData } from 'express-session';

interface CustomSession extends SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as CustomSession;
  console.log('Auth middleware - Session:', session);
  
  if (!session.user) {
    return res.redirect('/api/login');
  }
  
  next();
};