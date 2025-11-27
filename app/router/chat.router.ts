// src/router/chat.router.ts
import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';

const chatRouter = Router();

// Apply auth middleware to all chat routes
chatRouter.use(requireAuth);

// Single Page Route - Handles both list and active conversation
chatRouter.get('/', chatController.getChatPage);

// API Routes
chatRouter.get('/api/history/:swapRequestId', chatController.getChatHistory);
chatRouter.get('/api/conversations', chatController.getConversations);
chatRouter.post('/api/send', chatController.sendMessage);
chatRouter.get('/api/unread-count', chatController.getUnreadCount);

export { chatRouter };