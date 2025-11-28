// app/controllers/browse.controller.ts
import { Request, Response } from 'express';
import { userRepository } from '../repository/user.repository';
import { matchService } from '../service/match.service';
import { CustomSession } from '../../types/session.types';

class BrowseController {
  // Show all users with match scores
  browseUsers = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession;
      const currentUser = await userRepository.findUserbyEmail(session.user!.email);

      if (!currentUser) {
        return res.redirect('/api/login');
      }
      const searchQuery = req.query.search as string || '';
      const locationFilter = req.query.location as string || '';
      const experienceFilter = req.query.experience as string || '';
      const sortBy = req.query.sort as string || 'match'; 

      const allUsers = await userRepository.getAllUsers();

      let matchedUsers = await matchService.getAllUsersWithMatch(currentUser, allUsers);


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

      res.render('pages/browse/browseUser', {
        title: 'Browse Users - SkillSwap',
        currentUser: {
          id: currentUser._id.toString(),
          name: currentUser.name,
          email: currentUser.email,
        },
        user:currentUser,
        users: matchedUsers,
        searchQuery,
        locationFilter,
        experienceFilter,
        sortBy,
        locations,
        experienceLevels,
        totalUsers: matchedUsers.length,
      });

    } catch (error) {
      console.error('Browse error:', error);
      return res.redirect('/dashboard');
    }
  };
  searchSkills = async (req: Request, res: Response): Promise<any> => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json([]);
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

      res.json(matchingSkills);

    } catch (error) {
      console.error('Search skills error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  };
}

export const browseController = new BrowseController();