import { Document, Types } from 'mongoose';

export interface ISession extends Document {
  teacher: Types.ObjectId;
  student: Types.ObjectId;
  skill: string;
  hours: number;
  date: Date;
  rated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionInput {
  teacher: string;
  student: string;
  skill: string;
  hours: number;
  date: Date;
}

export interface IBalanceStats {
  hoursTaught: number;      // Use consistent naming
  hoursLearned: number;     // Use consistent naming
  balance: number;
  totalSessions: number;
}