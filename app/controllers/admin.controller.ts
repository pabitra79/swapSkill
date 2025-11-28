import { Request, Response } from 'express';
import { adminRepository } from '../repository/admin.repository';
import { AuthenticatedRequest } from '../../types/session.types'; 


class AdminController {

  async showDashboard(req: Request, res: Response) {
    try {
      const stats = await adminRepository.getPlatformStats();
      const activities = await adminRepository.getRecentActivities(5);
      const topSkills = await adminRepository.getTopSkills();

      res.render('admin/dashboard', {
        title: 'Admin Dashboard - SkillSwap',
        user: req.user,
        stats,
        activities,
        topSkills
      });
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      res.status(500).send('Error loading dashboard');
    }
  }

  async showAllUsers(req: Request, res: Response) {
    try {
      const users = await adminRepository.getAllUsers();

      res.render('admin/users', {
        title: 'Manage Users - Admin',
        user: req.user,
        users
      });
    } catch (error) {
      console.error('Error loading users:', error);
      res.status(500).send('Error loading users');
    }
  }


  async getUserDetails(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await adminRepository.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user details:', error);
      res.status(500).json({ error: 'Error fetching user details' });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;


      if (userId === req.user?._id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const deleted = await adminRepository.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  }


  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminRepository.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Error fetching statistics' });
    }
  }

  // Search users (API)
  async searchUsers(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query required' });
      }

      const users = await adminRepository.searchUsers(q);
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Error searching users' });
    }
  }
  async adminLogout(req: Request, res: Response) {
    try {

      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }


  async showAdminLogin(req: Request, res: Response) {
    try {
      if (req.user && req.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }

      res.render('admin/login', {
        title: 'Admin Login - SkillSwap'
      });
    } catch (error) {
      console.error('Error loading admin login:', error);
      res.status(500).send('Error loading login page');
    }
  }
}


export const adminController = new AdminController();