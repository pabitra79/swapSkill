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

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        name: string;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as CustomSession;
  
  console.log('🔐 Auth middleware - Session check:', {
    hasSession: !!req.session,
    sessionId: req.session?.id,
    hasUser: !!session?.user,
    userId: session?.user?.id
  });

  // Check if session exists
  if (!req.session) {
    console.error('❌ No session found');
    return res.status(401).json({
      success: false,
      message: 'No session found. Please log in again.'
    });
  }

  // Check if user exists in session
  if (!session.user || !session.user.id) {
    console.error('❌ User not authenticated in session');
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  // Map session user to req.user
  req.user = {
    _id: session.user.id,
    email: session.user.email,
    name: session.user.name
  };

  console.log('✅ User authenticated:', req.user._id);
  next();
};