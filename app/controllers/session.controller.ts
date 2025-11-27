import { Request, Response } from 'express';
import sessionRepository from '../repository/session.repository';
import { swapRequestRepository } from '../repository/swapRequest.repository'; 

export class SessionController {
  async showLogSessionForm(req: Request, res: Response) {
    try {
      // Use type assertion to access user
      const userId = (req as any).user._id;

      // Get all accepted swap partners from repository
      const acceptedSwaps = await swapRequestRepository.getAcceptedSwaps(userId);

      // Extract unique partners
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
        date: new Date(date)
      };

      // Create session using repository
      const newSession = await sessionRepository.createSession(sessionData);

      res.status(201).json({
        success: true,
        message: 'Session logged successfully!',
        sessionId: newSession._id
      });
    } catch (error) {
      console.error('Error logging session:', error);
      res.status(500).json({ error: 'Error logging session' });
    }
  }

  async getSessionHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      // Get sessions from repository
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

  async getUserBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      // Calculate balance using repository
      const balanceStats = await sessionRepository.calculateUserBalance(userId);

      res.json(balanceStats);
    } catch (error) {
      console.error('Error calculating balance:', error);
      res.status(500).json({ error: 'Error calculating balance' });
    }
  }
  async getDashboardStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user._id;

    // Get stats using repository
    const stats = await sessionRepository.calculateUserBalance(userId);

    // Ensure all required fields are present
    const responseStats = {
      totalSessions: stats.totalSessions || 0,
      hoursTaught: stats.hoursTaught || 0,
      hoursLearned: stats.hoursLearned || 0,
      balance: stats.balance || 0,
      completedSessions: stats.totalSessions || 0 // Add this if needed
    };

    res.json(responseStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
}
}

export const sessionController = new SessionController();