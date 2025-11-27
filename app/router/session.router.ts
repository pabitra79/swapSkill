import express from 'express';
import { sessionController } from '../controllers/session.controller';
import { requireAuth } from '../middleware/auth.middleware'; 

const sessionRouter = express.Router();

sessionRouter.use(requireAuth);

sessionRouter.get('/log', sessionController.showLogSessionForm);
sessionRouter.post('/log', sessionController.logSession);
sessionRouter.get('/history', sessionController.getSessionHistory);
sessionRouter.get('/balance', sessionController.getUserBalance);
sessionRouter.get('/stats', sessionController.getDashboardStats);
sessionRouter.get('/api/user/stats', sessionController.getDashboardStats);

sessionRouter.get('/rate/:sessionId', sessionController.showRatingForm);
sessionRouter.post('/rate/:sessionId', sessionController.submitRating);

export { sessionRouter };