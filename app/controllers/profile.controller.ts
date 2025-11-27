// app/controllers/profile.controller.ts
import { Request, Response } from 'express';
import { userRepository } from '../repository/user.repository';
import { CustomSession } from '../../types/session.types';
import { profileSchema } from '../validators/profile.validators';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sessionRepository from '../repository/session.repository';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

class ProfileController {
  showEditProfile = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession;
      const user = await userRepository.findUserbyEmail(session.user!.email);

      if (!user) {
        return res.redirect('/api/login');
      }

      res.render('pages/profile/edit-profile', {
        title: 'Edit Profile - SkillSwap',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profile: user.profile || {
            bio: '',
            teachSkills: [],
            learnSkills: [],
            availability: '',
            location: '',
            avatar: '',
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
          }
        },
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      return res.redirect('/dashboard');
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<any> => {

    try {
      const session = req.session as CustomSession;
      const user = await userRepository.findUserbyEmail(session.user!.email);

      if (!user) {
        return res.redirect('/api/login');
      }

      const { error, value } = profileSchema.validate(req.body);

      if (error) {
        return res.render('pages/profile/edit-profile', {
          title: 'Edit Profile - SkillSwap',
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            profile: user.profile
          },
          error: error.details[0].message,
          success: null
        });
      }
      const teachSkills = value.teachSkills 
        ? value.teachSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      
      const learnSkills = value.learnSkills
        ? value.learnSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      const profileData = {
        bio: value.bio || '',
        teachSkills,
        learnSkills,
        availability: value.availability || '',
        location: value.location || '',
        language: value.language || 'English',
        timezone: value.timezone || 'IST',
        experienceLevel: value.experienceLevel || '',
        hourlyRate: value.hourlyRate ? parseFloat(value.hourlyRate) : null,
        website: value.website || '',
        socialLinks: {
          github: value.github || '',
          linkedin: value.linkedin || '',
          twitter: value.twitter || ''
        },
        avatar: user.profile?.avatar || ''
      };

      await userRepository.updateUserProfile(user._id.toString(), profileData);

      return res.render('pages/profile/edit-profile', {
        title: 'Edit Profile - SkillSwap',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profile: profileData
        },
        error: null,
        success: 'Profile updated successfully!'
      });

    } catch (error) {
      console.error('Profile update error:', error);
      return res.redirect('/dashboard');
    }
  };

  uploadAvatar = [
    upload.single('avatar'),
    async (req: Request, res: Response): Promise<any> => {
      try {
        const session = req.session as CustomSession;
        const user = await userRepository.findUserbyEmail(session.user!.email);

        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        if (user.profile?.avatar) {
          const oldAvatarPath = path.join(process.cwd(), 'public', user.profile.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            try {
              fs.unlinkSync(oldAvatarPath);
            } catch (err) {
              console.error('Error deleting old avatar:', err);
            }
          }
        }
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        
        await userRepository.updateUserAvatar(user._id.toString(), avatarPath);

        res.json({ 
          success: true, 
          avatarUrl: avatarPath 
        });

      } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
      }
    }
  ];

  viewProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const session = req.session as CustomSession;
    const userId = req.params.userId;
    
    let user;
    let isOwnProfile = false;

    if (userId) {
      user = await userRepository.findUserById(userId);
      if (!user) {
        return res.status(404).render('pages/error', {
          title: 'User Not Found',
          message: 'The requested profile does not exist.'
        });
      }
      isOwnProfile = session.user?.email === user.email;
    } else {
      user = await userRepository.findUserbyEmail(session.user!.email);
      if (!user) {
        return res.redirect('/api/login');
      }
      isOwnProfile = true;
    }

    // 🔥 CALCULATE REAL STATS FROM SESSIONS
    const userStats = await sessionRepository.calculateUserBalance(user._id.toString());

    // Format the stats for the profile
    const profileStats = {
      completedSessions: userStats.totalSessions || 0,
      hoursTaught: userStats.hoursTaught || 0,
      hoursLearned: userStats.hoursLearned || 0,
      responseRate: user.stats?.responseRate || 0 // Keep existing response rate
    };

    res.render('pages/profile/view-profile', {
      title: `${user.name}'s Profile - SkillSwap`,
      userProfile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profile?.avatar || '',
        profile: user.profile || {
          bio: '',
          teachSkills: [],
          learnSkills: [],
          availability: '',
          location: '',
          avatar: '',
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
        stats: profileStats, // 🔥 Use real calculated stats
        createdAt: user.createdAt
      },
      isOwnProfile,
      currentUser: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    return res.redirect('/dashboard');
  }
};
}

export const profileController = new ProfileController();