// app/controllers/api/session.api.controller.ts
import { Request, Response } from 'express';
import sessionRepository from '../../repository/session.repository';
import { swapRequestRepository } from '../../repository/swapRequest.repository'; 
import { ratingService } from '../../service/rating.service';

class SessionApiController {
  async getPartners(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const acceptedSwaps = await swapRequestRepository.getAcceptedSwaps(userId);

      const partners = acceptedSwaps.map((swap: any) => {
        if (swap.fromUser._id.toString() === userId.toString()) {
          return swap.toUser;
        } else {
          return swap.fromUser;
        }
      });

      res.json({
        success: true,
        data: partners
      });
    } catch (error) {
      console.error('Error loading partners:', error);
      res.status(500).json({
        success: false,
        error: 'Error loading partners'
      });
    }
  }

  async logSession(req: Request, res: Response) {
    try {
      const { partnerId, skill, hours, date, role } = req.body;
      const userId = (req as any).user._id;

      if (!partnerId || !skill || !hours || !date || !role) {
        return res.status(400).json({ 
          success: false,
          error: 'All fields are required' 
        });
      }

      const swapExists = await swapRequestRepository.checkSwapExists(userId, partnerId);

      if (!swapExists) {
        return res.status(403).json({ 
          success: false,
          error: 'No accepted swap request with this user' 
        });
      }

      const sessionData = {
        teacher: role === 'teacher' ? userId : partnerId,
        student: role === 'teacher' ? partnerId : userId,
        skill: skill.trim(),
        hours: parseFloat(hours),
        date: new Date(date),
        rated: false
      };

      const newSession = await sessionRepository.createSession(sessionData);

      res.status(201).json({
        success: true,
        message: 'Session logged successfully!',
        data: {
          sessionId: newSession._id,
          partnerId: partnerId,
          role: role
        }
      });
    } catch (error) {
      console.error('Error logging session:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error logging session' 
      });
    }
  }

  async getSessionById(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user._id;

      const session = await sessionRepository.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          success: false,
          error: 'Session not found' 
        });
      }

      const teacherId = session.teacher._id ? session.teacher._id.toString() : session.teacher.toString();
      const studentId = session.student._id ? session.student._id.toString() : session.student.toString();

      if (teacherId !== userId && studentId !== userId) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized' 
        });
      }

      const userToRate = teacherId === userId ? session.student : session.teacher;

      res.json({
        success: true,
        data: {
          session,
          userToRate,
          canRate: !session.rated
        }
      });

    } catch (error) {
      console.error('Error loading session:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to load session' 
      });
    }
  }

  async submitRating(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user._id;
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please provide a valid rating between 1 and 5 stars' 
        });
      }

      const session = await sessionRepository.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          success: false, 
          error: 'Session not found' 
        });
      }

      const teacherId = session.teacher._id ? session.teacher._id.toString() : session.teacher.toString();
      const studentId = session.student._id ? session.student._id.toString() : session.student.toString();

      if (teacherId !== userId && studentId !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: 'You are not authorized to rate this session' 
        });
      }

      if (session.rated) {
        return res.status(400).json({ 
          success: false, 
          error: 'This session has already been rated' 
        });
      }

      const ratedUserId = teacherId === userId ? studentId : teacherId;
      const raterRole = teacherId === userId ? 'teacher' as const : 'student' as const;

      const ratingResult = await ratingService.submitRating({
        sessionId: sessionId,
        raterId: userId,
        ratedUserId: ratedUserId,
        rating: parseInt(rating),
        comment: comment || '',
        raterRole: raterRole
      });

      if (ratingResult.success) {
        await sessionRepository.markSessionAsRated(sessionId);

        res.json({
          success: true,
          message: 'Rating submitted successfully!',
          data: {
            ratingId: ratingResult.ratingId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: ratingResult.error
        });
      }

    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to submit rating' 
      });
    }
  }

  async getSessionHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const sessions = await sessionRepository.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error loading sessions' 
      });
    }
  }

  async getUserBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const balanceStats = await sessionRepository.calculateUserBalance(userId);

      res.json({
        success: true,
        data: balanceStats
      });
    } catch (error) {
      console.error('Error calculating balance:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error calculating balance' 
      });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const stats = await sessionRepository.calculateUserBalance(userId);

      const responseStats = {
        totalSessions: stats.totalSessions || 0,
        hoursTaught: stats.hoursTaught || 0,
        hoursLearned: stats.hoursLearned || 0,
        balance: stats.balance || 0,
        completedSessions: stats.totalSessions || 0
      };

      res.json({
        success: true,
        data: responseStats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error fetching statistics' 
      });
    }
  }
}

export const sessionApiController = new SessionApiController();