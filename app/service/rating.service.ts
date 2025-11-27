// src/service/rating.service.ts
import { IRatingInput } from '../interfaces/Irating.interface';
import { ratingRepository } from '../repository/rating.repository';

export class RatingService {
  async submitRating(ratingData: {
    sessionId: string;
    raterId: string;
    ratedUserId: string;
    rating: number;
    comment: string;
    raterRole: string; // Accept string first
  }) {
    try {
      // Validate raterRole
      if (ratingData.raterRole !== 'teacher' && ratingData.raterRole !== 'student') {
        return { success: false, error: 'Invalid rater role' };
      }

      // Type assertion after validation
      const validRatingData: IRatingInput = {
        ...ratingData,
        raterRole: ratingData.raterRole as 'teacher' | 'student'
      };

      // Check if rating already exists for this session from this user
      const existingRating = await ratingRepository.getRatingBySessionAndRater(
        ratingData.sessionId, 
        ratingData.raterId
      );

      if (existingRating) {
        return { success: false, error: 'You have already rated this session' };
      }

      // Create new rating with validated data
      const newRating = await ratingRepository.createRating(validRatingData);

      return { 
        success: true, 
        ratingId: newRating._id,
        message: 'Rating submitted successfully'
      };
    } catch (error) {
      console.error('Error in submitRating:', error);
      return { success: false, error: 'Failed to submit rating' };
    }
  }

  async getUserRatings(userId: string) {
    try {
      const ratings = await ratingRepository.getRatingsByUser(userId);
      return { success: true, ratings };
    } catch (error) {
      console.error('Error getting user ratings:', error);
      return { success: false, error: 'Failed to get ratings' };
    }
  }

  async getAverageRating(userId: string) {
    try {
      const average = await ratingRepository.getAverageRating(userId);
      return { success: true, averageRating: average };
    } catch (error) {
      console.error('Error getting average rating:', error);
      return { success: false, error: 'Failed to get average rating' };
    }
  }
}

export const ratingService = new RatingService();