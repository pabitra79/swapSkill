// src/models/rating.model.ts
import mongoose, { Schema } from 'mongoose';
import { IRating } from '../interfaces/Irating.interface';

const ratingSchema = new Schema<IRating>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  raterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  raterRole: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per session per user
ratingSchema.index({ sessionId: 1, raterId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', ratingSchema);