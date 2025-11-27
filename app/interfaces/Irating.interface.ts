// src/interfaces/IRating.interface.ts
import { Document, Types } from 'mongoose';

export interface IRating extends Document {
  sessionId: Types.ObjectId;
  raterId: Types.ObjectId;
  ratedUserId: Types.ObjectId;
  rating: number;
  comment?: string;
  raterRole: 'teacher' | 'student';
  createdAt: Date;
  updatedAt: Date;
}

export interface IRatingInput {
  sessionId: string | Types.ObjectId;  // Allow both
  raterId: string | Types.ObjectId;    // Allow both
  ratedUserId: string | Types.ObjectId; // Allow both
  rating: number;
  comment?: string;
  raterRole: 'teacher' | 'student';
}