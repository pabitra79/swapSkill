
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { CustomSession } from '../../types/session.types';
import { userRepository } from '../repository/user.repository';
import { matchService } from '../service/match.service';  
import { IMatchedUser } from '../interfaces/match.interface';
const Homerouter = Router();

// Public routes
Homerouter.get("/", (req, res) => {
  const session = req.session as CustomSession;
  res.render("pages/home", {
    title: "Home - SkillSwap",
    user: session.user || null,
  });
});

Homerouter.get("/about", (req, res) => {
  res.render("pages/about", {
    title: "About - SkillSwap",  // ← Fixed: was "Home"
  });
});

// Dashboard route with match support
Homerouter.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const session = req.session as CustomSession;
    const user = await userRepository.findUserbyEmail(session.user!.email);
    
    if (!user) {
      return res.redirect('/api/login');
    }

    // Check if profile is complete
    const isProfileComplete = Boolean(
      user.profile?.bio && 
      user.profile?.teachSkills?.length > 0 && 
      user.profile?.learnSkills?.length > 0
    );

    // Get top matches
    let topMatches: IMatchedUser[] = [];
    try {
      const allUsers = await userRepository.getAllUsers();
      topMatches = await matchService.findTopMatches(user, allUsers, 5);
    } catch (error) {
      console.log('Match service error:', error);
    }

    res.render("pages/dashboard/Dashboard", {
      title: "Dashboard - SkillSwap",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profile: user.profile || {
          teachSkills: [],
          learnSkills: [],
          avatar: '',
          bio: '',
          location: '',
          availability: '',
          language: 'English',
          timezone: 'IST',
          experienceLevel: '',
          hourlyRate: null,
          website: '',
          socialLinks: {
            github: '',
            linkedin: '',
            twitter: ''
          }
        },
        stats: user.stats || {
          hoursTaught: 0,
          hoursLearned: 0,
          completedSessions: 0,
          responseRate: 0
        }
      },
      topMatches: topMatches,
      isProfileComplete: isProfileComplete
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/api/login');
  }
});

export { Homerouter };