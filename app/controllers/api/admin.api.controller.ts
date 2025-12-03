// app/controllers/api/admin.api.controller.ts
import { Request, Response } from 'express';
import { adminRepository } from '../../repository/admin.repository';
import { AuthenticatedRequest } from '../../../types/session.types';

class AdminApiController {
  async getDashboard(req: Request, res: Response) {
    try {
      const stats = await adminRepository.getPlatformStats();
      const activities = await adminRepository.getRecentActivities(5);
      const topSkills = await adminRepository.getTopSkills();

      res.json({
        success: true,
        data: {
          stats: stats || {
            totalUsers: 0,
            verifiedUsers: 0,
            totalSessions: 0,
            totalHours: 0,
            totalSwapRequests: 0,
            acceptedSwaps: 0
          },
          activities: activities || {
            recentUsers: [],
            recentSessions: []
          },
          topSkills: topSkills || {
            topTeach: [],
            topLearn: []
          }
        }
      });
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Error loading dashboard'
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await adminRepository.getAllUsers();

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error loading users:', error);
      res.status(500).json({
        success: false,
        error: 'Error loading users'
      });
    }
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await adminRepository.getUserById(userId);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user details:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error fetching user details' 
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (userId === req.user?._id) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot delete your own account' 
        });
      }

      const deleted = await adminRepository.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error deleting user' 
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminRepository.getPlatformStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error fetching statistics' 
      });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: 'Search query required' 
        });
      }

      const users = await adminRepository.searchUsers(q);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error searching users' 
      });
    }
  }

  async adminLogout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Logout failed' 
          });
        }
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Logout failed' 
      });
    }
  }
}

export const adminApiController = new AdminApiController();