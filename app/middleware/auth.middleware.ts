import { Request, Response, NextFunction } from 'express';
import { SessionData } from 'express-session';

interface CustomSession extends SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';  
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
        role: 'user' | 'admin';  
      };
    }
  }
}

// Existing middleware - Updated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as CustomSession;
  
  console.log(' Auth middleware - Session check:', {
    hasSession: !!req.session,
    sessionId: req.session?.id,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userRole: session?.user?.role  
  });

  // Check if session exists
  if (!req.session) {
    console.error(' No session found');
    return res.status(401).json({
      success: false,
      message: 'No session found. Please log in again.'
    });
  }

  // Check if user exists in session
  if (!session.user || !session.user.id) {
    console.error(' User not authenticated in session');
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }


  req.user = {
    _id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role  // ← ADD ROLE HERE
  };

  console.log(' User authenticated:', req.user._id, 'Role:', req.user.role);
  next();
};

// NEW MIDDLEWARE - Admin Only
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as CustomSession;
  
  console.log(' Admin middleware - Checking admin access');

  // First check authentication
  if (!req.session || !session.user || !session.user.id) {
    console.error(' User not authenticated');
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

 
  req.user = {
    _id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role
  };

  // Check if user is admin
  if (req.user.role !== 'admin') {
    console.error(' Access denied - User is not admin');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  console.log(' Admin access granted:', req.user._id);
  next();
};