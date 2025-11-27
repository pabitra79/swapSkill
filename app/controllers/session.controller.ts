import { Request, Response } from 'express';
import sessionRepository from '../repository/session.repository';
import { swapRequestRepository } from '../repository/swapRequest.repository'; 
import { ratingService } from '../service/rating.service';

export class SessionController {
  async showLogSessionForm(req: Request, res: Response) {
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

      res.render('sessions/log-session', {
        title: 'Log Session',
        partners,
        user: (req as any).user
      });
    } catch (error) {
      console.error('Error loading log session form:', error);
      res.status(500).send('Error loading form');
    }
  }

  async logSession(req: Request, res: Response) {
    try {
      const { partnerId, skill, hours, date, role } = req.body;
      const userId = (req as any).user._id;

      // Validation
      if (!partnerId || !skill || !hours || !date || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if swap request exists and is accepted
      const swapExists = await swapRequestRepository.checkSwapExists(userId, partnerId);

      if (!swapExists) {
        return res.status(403).json({ error: 'No accepted swap request with this user' });
      }

      // Prepare session data based on role
      const sessionData = {
        teacher: role === 'teacher' ? userId : partnerId,
        student: role === 'teacher' ? partnerId : userId,
        skill: skill.trim(),
        hours: parseFloat(hours),
        date: new Date(date),
        rated: false
      };

      // Create session using repository
      const newSession = await sessionRepository.createSession(sessionData);

      res.status(201).json({
        success: true,
        message: 'Session logged successfully!',
        sessionId: newSession._id,
        partnerId: partnerId,
        role: role
      });
    } catch (error) {
      console.error('Error logging session:', error);
      res.status(500).json({ error: 'Error logging session' });
    }
  }

  // New: Show rating form
  // New: Show rating form
// New: Show rating form
async showRatingForm(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user._id;

    console.log('🔍 Loading rating form for session:', sessionId);
    console.log('🔍 Current user:', userId);

    // Get session details
    const session = await sessionRepository.getSessionById(sessionId);
    
    if (!session) {
      console.log('❌ Session not found:', sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log('🔍 Session found:', session._id);
    console.log('🔍 Session teacher:', session.teacher);
    console.log('🔍 Session student:', session.student);

    // FIX: Handle both string and object IDs for teacher and student
    const teacherId = session.teacher._id ? session.teacher._id.toString() : session.teacher.toString();
    const studentId = session.student._id ? session.student._id.toString() : session.student.toString();

    console.log('🔍 Teacher ID:', teacherId);
    console.log('🔍 Student ID:', studentId);
    console.log('🔍 Current User ID:', userId);

    // FIX: Compare properly
    if (teacherId !== userId && studentId !== userId) {
      console.log('❌ User not authorized to rate this session');
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if already rated
    if (session.rated) {
      console.log('ℹ️ Session already rated');
      return res.render('sessions/already-rated', {
        title: 'Already Rated',
        session,
        user: (req as any).user
      });
    }

    // Determine who to rate (the other person in the session)
    const userToRate = teacherId === userId ? session.student : session.teacher;

    console.log('✅ Rendering rating page for session:', sessionId);

    // Render the rating page
    res.render('sessions/rate-session', {
      title: 'Rate Session',
      session,
      userToRate,
      user: (req as any).user
    });

  } catch (error) {
    console.error('❌ Error loading rating form:', error);
    res.status(500).json({ error: 'Failed to load rating form' });
  }
}

  // New: Submit rating
  // New: Submit rating
async submitRating(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user._id;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid rating between 1 and 5 stars' 
      });
    }

    // Get session details
    const session = await sessionRepository.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    // FIX: Handle both string and object IDs
    const teacherId = session.teacher._id ? session.teacher._id.toString() : session.teacher.toString();
    const studentId = session.student._id ? session.student._id.toString() : session.student.toString();

    // Check if user is part of this session
    if (teacherId !== userId && studentId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'You are not authorized to rate this session' 
      });
    }

    // Check if already rated
    if (session.rated) {
      return res.status(400).json({ 
        success: false, 
        error: 'This session has already been rated' 
      });
    }

    // Determine who is being rated (the other person in the session)
    const ratedUserId = teacherId === userId ? studentId : teacherId;
    
    const raterRole = teacherId === userId ? 'teacher' as const : 'student' as const;

    // Submit rating
    const ratingResult = await ratingService.submitRating({
      sessionId: sessionId,
      raterId: userId,
      ratedUserId: ratedUserId,
      rating: parseInt(rating),
      comment: comment || '',
      raterRole: raterRole
    });

    if (ratingResult.success) {
      // Mark session as rated
      await sessionRepository.markSessionAsRated(sessionId);

      res.json({
        success: true,
        message: 'Rating submitted successfully!',
        ratingId: ratingResult.ratingId
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

  // Get session history (existing method)
  async getSessionHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const sessions = await sessionRepository.getUserSessions(userId);

      res.render('sessions/history', {
        title: 'Session History',
        sessions,
        userId: userId.toString(),
        user: (req as any).user
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).send('Error loading sessions');
    }
  }

  // Get user balance (existing method)
  async getUserBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const balanceStats = await sessionRepository.calculateUserBalance(userId);

      res.json(balanceStats);
    } catch (error) {
      console.error('Error calculating balance:', error);
      res.status(500).json({ error: 'Error calculating balance' });
    }
  }

  // Get dashboard stats (existing method)
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

      res.json(responseStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Error fetching statistics' });
    }
  }
}

export const sessionController = new SessionController();