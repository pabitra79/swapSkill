// types/session.types.ts
import { SessionData } from 'express-session';

export interface CustomSession extends SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}