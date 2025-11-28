// types/session.types.ts
import { SessionData } from 'express-session';
import { Request } from 'express';

export interface CustomSession extends SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';  
  };
  token?: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';  
  };
}