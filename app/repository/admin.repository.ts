import { User } from '../models/user.model';
import { SwapRequest } from '../models/swapRequest.model';
import Session from '../models/session.model';

class AdminRepository {
  // Get all users
  async getAllUsers() {
    try {
      return await User.find()
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error(' Error getting all users:', error);
      throw error;
    }
  }

  // Get user by id with full details
  async getUserById(userId: string) {
    try {
      return await User.findById(userId)
        .select('-password -verificationToken -resetPasswordToken');
    } catch (error) {
      console.error(' Error getting user by ID:', error);
      throw error;
    }
  }


  async deleteUser(userId: string) {
    try {

      await SwapRequest.deleteMany({
        $or: [{ fromUser: userId }, { toUser: userId }]
      });
      await Session.deleteMany({
        $or: [{ teacher: userId }, { student: userId }]
      });

      // Delete user
      const result = await User.findByIdAndDelete(userId);
      return result !== null;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }


  async getPlatformStats() {
    try {
      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ isVerified: true });
      const totalSwapRequests = await SwapRequest.countDocuments();
      const acceptedSwaps = await SwapRequest.countDocuments({ status: 'accepted' });
      const totalSessions = await Session.countDocuments();

      // Calculate total hours
      const sessionsData = await Session.find();
      const totalHours = sessionsData.reduce((sum, session) => sum + session.hours, 0);


      const acceptanceRate = totalSwapRequests > 0 
        ? ((acceptedSwaps / totalSwapRequests) * 100).toFixed(0) 
        : 0;

      console.log(' Platform Stats:', {
        totalUsers,
        verifiedUsers,
        totalSwapRequests,
        acceptedSwaps,
        totalSessions,
        totalHours
      });

      return {
        totalUsers,
        verifiedUsers,
        totalSwapRequests,
        acceptedSwaps,
        totalSessions,
        totalHours
      };
    } catch (error) {
      console.error(' Error getting platform stats:', error);
      throw error;
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10) {
    try {
      const recentUsers = await User.find()
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .limit(limit);

      const recentSessions = await Session.find()
        .populate('teacher', 'name')
        .populate('student', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

      console.log(' Recent Activities:', {
        usersCount: recentUsers.length,
        sessionsCount: recentSessions.length
      });

      return {
        recentUsers,
        recentSessions
      };
    } catch (error) {
      console.error(' Error getting recent activities:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query: string) {
    try {
      return await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).select('-password -verificationToken -resetPasswordToken');
    } catch (error) {
      console.error(' Error searching users:', error);
      throw error;
    }
  }

  // Get top skills
  async getTopSkills() {
    try {
      const users = await User.find({ isVerified: true });
      
      const teachSkills: { [key: string]: number } = {};
      const learnSkills: { [key: string]: number } = {};

      users.forEach(user => {
        user.profile.teachSkills.forEach(skill => {
          teachSkills[skill] = (teachSkills[skill] || 0) + 1;
        });
        user.profile.learnSkills.forEach(skill => {
          learnSkills[skill] = (learnSkills[skill] || 0) + 1;
        });
      });

      // Convert to arrays and sort
      const topTeach = Object.entries(teachSkills)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const topLearn = Object.entries(learnSkills)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      console.log(' Top Skills:', {
        topTeachCount: topTeach.length,
        topLearnCount: topLearn.length
      });

      return { topTeach, topLearn };
    } catch (error) {
      console.error(' Error getting top skills:', error);
      throw error;
    }
  }
}

export const adminRepository = new AdminRepository();