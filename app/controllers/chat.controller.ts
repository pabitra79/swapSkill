// src/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { chatMessageService } from '../service/chatMessage.service';
import { swapRequestRepository } from '../repository/swapRequest.repository';

export class ChatController {
    constructor() {
        this.getChatPage = this.getChatPage.bind(this);
        this.getChatHistory = this.getChatHistory.bind(this);
        this.getConversations = this.getConversations.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

   private getUserId(req: Request): string {
        if (req.user && req.user._id) return req.user._id.toString();
        throw new Error('User not authenticated');
    }

   async getChatPage(req: Request, res: Response) {
    try {
        const userId = this.getUserId(req);
        const { conversation: activeConversationId } = req.query;
        
        const conversations = await chatMessageService.getConversations(userId);
        
        // DEBUG: Log conversations
        console.log('🔍 Conversations to render:', conversations.length);
        conversations.forEach((conv, i) => {
            console.log(`  ${i + 1}. ${conv.otherUser.name} (ID: ${conv.swapRequestId})`);
        });
        
        let activeConversation = null;

        if (activeConversationId && typeof activeConversationId === 'string') {
            activeConversation = conversations.find(c => c.swapRequestId === activeConversationId);
        }

        res.render('pages/chat/index', {
            title: 'Messages - SkillSwap',
            conversations,
            activeConversation,
            currentUser: req.user
        });
    } catch (error) {
        console.error('❌ Chat page error:', error);
        res.status(500).render('error', {
            title: 'Error - SkillSwap',
            message: 'Failed to load chat'
        });
    }
}

    async getChatHistory(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { swapRequestId } = req.params;
            const result = await chatMessageService.getChatHistory(swapRequestId, userId);
            
            if (result.success) res.json({ success: true, messages: result.messages });
            else res.status(400).json({ success: false, error: result.error });
        } catch (error: any) {
            res.status(500).json({ success: false, error: 'Failed to load chat history' });
        }
    }

    async sendMessage(req: Request, res: Response) {
    try {
        const userId = this.getUserId(req);
        const { swapRequestId, message } = req.body; // Remove toUserId
        
        const result = await chatMessageService.sendMessage({ 
            swapRequestId, 
            fromUserId: userId, 
            message // Only pass message, let service determine toUserId
        });

        if (result.success) {
            const io = (req as any).app.get('io');
            if (io && result.message) {
                io.to(`chat_${swapRequestId}`).emit('new_message', result.message);
            }
            res.json({ success: true, message: result.message });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
}


    // API: Get all conversations (for sidebar)
    async getConversations(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const conversations = await chatMessageService.getConversations(userId);

            res.json({ success: true, conversations });
        } catch (error: any) {
            console.error('❌ Get conversations error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load conversations'
            });
        }
    }

    // API: Get unread count
    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const count = await chatMessageService.getUnreadCount(userId);

            res.json({ success: true, count });
        } catch (error: any) {
            console.error('❌ Get unread count error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get unread count'
            });
        }
    }
}

export const chatController = new ChatController();