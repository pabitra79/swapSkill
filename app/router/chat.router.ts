// src/router/chat.router.ts
import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';

const chatRouter = Router();

// Apply auth middleware to all chat routes


// Single Page Route - Handles both list and active conversation
chatRouter.get('/', requireAuth,chatController.getChatPage);

// API Routes
chatRouter.get('/api/history/:swapRequestId',requireAuth, chatController.getChatHistory);
chatRouter.get('/api/conversations',requireAuth, chatController.getConversations);
chatRouter.post('/api/send', requireAuth,chatController.sendMessage);
chatRouter.get('/api/unread-count',requireAuth, chatController.getUnreadCount);

export { chatRouter };