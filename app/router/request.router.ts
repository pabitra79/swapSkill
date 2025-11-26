import { Router } from 'express';
import { requestController } from '../controllers/request.controller';
import { requireAuth } from '../middleware/auth.middleware';

const Swaprouter = Router();

// Apply auth middleware to all routes
Swaprouter.use(requireAuth);

// Page routes (render EJS templates)
Swaprouter.get('/inbox', requestController.getInbox);
Swaprouter.get('/outbox', requestController.getOutbox);

// API routes
Swaprouter.post('/send', requestController.sendRequest);
Swaprouter.post('/:requestId/accept', requestController.acceptRequest);
Swaprouter.post('/:requestId/decline', requestController.declineRequest);
Swaprouter.post('/:requestId/cancel', requestController.cancelRequest);
Swaprouter.get('/:requestId', requestController.getRequestById);
Swaprouter.get('/connection/:userId2', requestController.checkConnection);

export {Swaprouter};