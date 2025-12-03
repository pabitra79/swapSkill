// app/controllers/api/browse.api.controller.ts
import { Request, Response } from 'express';
import { userRepository } from '../../repository/user.repository';
import { matchService } from '../../service/match.service';
import { CustomSession } from '../../../types/session.types';

class BrowseApiController {
  browseUsers = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession;
      
      if (!session.user || !session.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const currentUser = await userRepository.findUserbyEmail(session.user!.email);

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      const searchQuery = req.query.search as string || '';
      const locationFilter = req.query.location as string || '';
      const experienceFilter = req.query.experience as string || '';
      const sortBy = req.query.sort as string || 'match'; 

      const allUsers = await userRepository.getAllUsers();
      let matchedUsers = await matchService.getAllUsersWithMatch(currentUser, allUsers);

      // Apply filters
      if (searchQuery) {
        matchedUsers = matchedUsers.filter(item => {
          const teachSkills = item.user.profile?.teachSkills || [];
          const learnSkills = item.user.profile?.learnSkills || [];
          const allSkills = [...teachSkills, ...learnSkills];
          
          return allSkills.some(skill => 
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ) || item.user.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }

      if (locationFilter) {
        matchedUsers = matchedUsers.filter(item => 
          item.user.profile?.location?.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      if (experienceFilter) {
        matchedUsers = matchedUsers.filter(item => 
          item.user.profile?.experienceLevel === experienceFilter
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          matchedUsers.sort((a, b) => 
            new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime()
          );
          break;
        case 'name':
          matchedUsers.sort((a, b) => 
            a.user.name.localeCompare(b.user.name)
          );
          break;
        case 'match':
        default:
          break;
      }

      const locations = [...new Set(
        allUsers
          .map(u => u.profile?.location)
          .filter(Boolean)
      )];

      const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

      res.json({
        success: true,
        data: {
          users: matchedUsers,
          totalUsers: matchedUsers.length,
          filters: {
            locations,
            experienceLevels
          },
          appliedFilters: {
            search: searchQuery,
            location: locationFilter,
            experience: experienceFilter,
            sort: sortBy
          }
        }
      });

    } catch (error) {
      console.error('Browse error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  };

  searchSkills = async (req: Request, res: Response): Promise<any> => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const allUsers = await userRepository.getAllUsers();
      const allSkills = new Set<string>();
      
      allUsers.forEach((user: { profile: { teachSkills: any[]; learnSkills: any[]; }; }) => {
        user.profile?.teachSkills?.forEach(skill => allSkills.add(skill));
        user.profile?.learnSkills?.forEach(skill => allSkills.add(skill));
      });

      const matchingSkills = Array.from(allSkills)
        .filter(skill => skill.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);

      res.json({
        success: true,
        data: matchingSkills
      });

    } catch (error) {
      console.error('Search skills error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Search failed' 
      });
    }
  };
}

export const browseApiController = new BrowseApiController();