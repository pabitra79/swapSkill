// types/express.d.ts
import 'express';
import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';  
    };
    token?: string;
  }
}

declare module 'express' {
  interface Request {
    user?: {
      _id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';  
    };
  }
}