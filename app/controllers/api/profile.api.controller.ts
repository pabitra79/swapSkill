// app/controllers/api/profile.api.controller.ts
import { Request, Response } from 'express';
import { userRepository } from '../../repository/user.repository';
import { CustomSession } from '../../../types/session.types';
import { profileSchema } from '../../validators/profile.validators';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sessionRepository from '../../repository/session.repository';

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

class ProfileApiController {
  getProfile = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession;
      const user = await userRepository.findUserbyEmail(session.user!.email);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
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
        }
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to load profile'
      });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
      const session = req.session as CustomSession;
      const user = await userRepository.findUserbyEmail(session.user!.email);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      const { error, value } = profileSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
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

      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profile: profileData
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  };

  uploadAvatar = [
    upload.single('avatar'),
    async (req: Request, res: Response): Promise<any> => {
      try {
        const session = req.session as CustomSession;
        const user = await userRepository.findUserbyEmail(session.user!.email);

        if (!user) {
          return res.status(401).json({ 
            success: false,
            error: 'Unauthorized' 
          });
        }

        if (!req.file) {
          return res.status(400).json({ 
            success: false,
            error: 'No file uploaded' 
          });
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
          message: 'Avatar uploaded successfully',
          data: {
            avatarUrl: avatarPath
          }
        });

      } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ 
          success: false,
          error: 'Failed to upload avatar' 
        });
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
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }
        isOwnProfile = session.user?.email === user.email;
      } else {
        user = await userRepository.findUserbyEmail(session.user!.email);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'User not found'
          });
        }
        isOwnProfile = true;
      }

      const userStats = await sessionRepository.calculateUserBalance(user._id.toString());

      const profileStats = {
        completedSessions: userStats.totalSessions || 0,
        hoursTaught: userStats.hoursTaught || 0,
        hoursLearned: userStats.hoursLearned || 0,
        responseRate: user.stats?.responseRate || 0 
      };

      res.json({
        success: true,
        data: {
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
            stats: profileStats,
            createdAt: user.createdAt
          },
          isOwnProfile
        }
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to load profile'
      });
    }
  };
}

export const profileApiController = new ProfileApiController();