import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.get('/dashboard', adminController.showDashboard);

// User management
adminRouter.get('/users', adminController.showAllUsers);
adminRouter.get('/users/:userId', adminController.getUserDetails);
adminRouter.delete('/users/:userId', adminController.deleteUser);


adminRouter.post('/logout', adminController.adminLogout);

export { adminRouter };