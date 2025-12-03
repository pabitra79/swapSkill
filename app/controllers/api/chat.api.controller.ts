// app/controllers/api/chat.api.controller.ts
import { Request, Response } from 'express';
import { chatMessageService } from '../../service/chatMessage.service';

export class ChatApiController {
    constructor() {
        this.getChatHistory = this.getChatHistory.bind(this);
        this.getConversations = this.getConversations.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getUnreadCount = this.getUnreadCount.bind(this);
    }

    private getUserId(req: Request): string {
        if (req.user && req.user._id) return req.user._id.toString();
        throw new Error('User not authenticated');
    }

    async getChatHistory(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { swapRequestId } = req.params;
            
            console.log(' Loading chat history:', { swapRequestId, userId });
            
            const result = await chatMessageService.getChatHistory(swapRequestId, userId);
            
            if (result.success) {
                console.log(' Loaded', result.messages?.length || 0, 'messages');
                res.json({ 
                    success: true, 
                    data: result.messages || [] 
                });
            } else {
                console.error(' Failed to load messages:', result.error);
                res.status(400).json({ 
                    success: false, 
                    error: result.error 
                });
            }
        } catch (error: any) {
            console.error(' Get chat history error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to load chat history' 
            });
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { swapRequestId, message } = req.body; 
            
            console.log(' Sending message:', { swapRequestId, userId, messageLength: message?.length });
            
            if (!swapRequestId || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Swap request ID and message are required'
                });
            }

            const result = await chatMessageService.sendMessage({ 
                swapRequestId, 
                fromUserId: userId, 
                message 
            });

            if (result.success) {
                const io = (req as any).app.get('io');
                if (io && result.message) {
                    console.log(' Emitting new message via Socket.io');
                    io.to(`chat_${swapRequestId}`).emit('new_message', result.message);
                }
                res.json({ 
                    success: true, 
                    data: result.message 
                });
            } else {
                res.status(400).json({ 
                    success: false, 
                    error: result.error 
                });
            }
        } catch (error: any) {
            console.error(' Send message error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send message' 
            });
        }
    }

    async getConversations(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            console.log(' Getting conversations for user:', userId);
            
            const conversations = await chatMessageService.getConversations(userId);
            console.log(' Found conversations:', conversations.length);

            res.json({ 
                success: true, 
                data: conversations || [] 
            });
        } catch (error: any) {
            console.error(' Get conversations error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load conversations'
            });
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const count = await chatMessageService.getUnreadCount(userId);

            res.json({ 
                success: true, 
                data: { count } 
            });
        } catch (error: any) {
            console.error(' Get unread count error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get unread count'
            });
        }
    }
}

export const chatApiController = new ChatApiController();