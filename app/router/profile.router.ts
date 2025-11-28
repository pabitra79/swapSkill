
import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth.middleware';

const ProfileRouter = Router();

ProfileRouter.get('/profile', requireAuth, profileController.viewProfile);
ProfileRouter.get('/profile/edit', requireAuth, profileController.showEditProfile);
ProfileRouter.post('/profile/edit', requireAuth, profileController.updateProfile);
ProfileRouter.post('/profile/upload-avatar', requireAuth, ...profileController.uploadAvatar);
ProfileRouter.get('/profile/view/:userId', requireAuth, profileController.viewProfile); 
ProfileRouter.get('/profile', requireAuth, profileController.viewProfile); 

export { ProfileRouter };