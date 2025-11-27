// src/repository/rating.repository.ts
import Rating from '../models/rating.model';
import { IRating, IRatingInput } from '../interfaces/Irating.interface';
import { Types } from 'mongoose';

class RatingRepository {
  async createRating(ratingData: IRatingInput): Promise<IRating> {
    // Convert string IDs to ObjectIds if needed
    const processedData = {
      ...ratingData,
      sessionId: typeof ratingData.sessionId === 'string' ? 
        new Types.ObjectId(ratingData.sessionId) : ratingData.sessionId,
      raterId: typeof ratingData.raterId === 'string' ? 
        new Types.ObjectId(ratingData.raterId) : ratingData.raterId,
      ratedUserId: typeof ratingData.ratedUserId === 'string' ? 
        new Types.ObjectId(ratingData.ratedUserId) : ratingData.ratedUserId,
    };
    
    const rating = await Rating.create(processedData);
    return rating;
  }

  async getRatingBySessionAndRater(sessionId: string, raterId: string): Promise<IRating | null> {
    return await Rating.findOne({ sessionId, raterId });
  }

  async getRatingsByUser(userId: string): Promise<IRating[]> {
    return await Rating.find({ ratedUserId: userId })
      .populate('raterId', 'name profile')
      .populate('sessionId', 'skill hours date')
      .sort({ createdAt: -1 });
  }

  async getAverageRating(userId: string): Promise<number> {
    const result = await Rating.aggregate([
      { $match: { ratedUserId: userId } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    
    return result.length > 0 ? Math.round(result[0].average * 10) / 10 : 0;
  }

  async getRatingCount(userId: string): Promise<number> {
    return await Rating.countDocuments({ ratedUserId: userId });
  }
}

export const ratingRepository = new RatingRepository();