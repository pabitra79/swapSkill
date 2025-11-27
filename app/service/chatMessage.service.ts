// src/service/chatMessage.service.ts
import { chatMessageRepository } from '../repository/chatMessage.repository';
import { swapRequestRepository } from '../repository/swapRequest.repository';
import { IChatMessage, IChatConversation } from '../interfaces/IchatMessage.interface';

export class ChatMessageService {

    async sendMessage(data: {
        swapRequestId: string;
        fromUserId: string;
        message: string;
    }): Promise<{ success: boolean; message?: IChatMessage; error?: string }> {
        try {
            console.log('💬 sendMessage - Data:', data);
            
            const swapRequest = await swapRequestRepository.findById(data.swapRequestId);
            if (!swapRequest) {
                console.log('❌ Swap request not found');
                return { success: false, error: 'Swap request not found' };
            }

            console.log('✅ Swap request found:', swapRequest._id);
            console.log('📋 Swap request details:', {
                status: swapRequest.status,
                fromUser: swapRequest.fromUser,
                toUser: swapRequest.toUser,
                fromUserType: typeof swapRequest.fromUser,
                toUserType: typeof swapRequest.toUser
            });

            // Handle both populated and non-populated user objects
            const fromUserIdStr = swapRequest.fromUser._id 
                ? swapRequest.fromUser._id.toString() 
                : swapRequest.fromUser.toString();
            const toUserIdStr = swapRequest.toUser._id 
                ? swapRequest.toUser._id.toString() 
                : swapRequest.toUser.toString();
            
            const currentUserId = data.fromUserId.toString();
            
            console.log('🔍 Comparing IDs:', {
                fromUserIdStr,
                toUserIdStr,
                currentUserId,
                isFromUser: fromUserIdStr === currentUserId,
                isToUser: toUserIdStr === currentUserId
            });

            const isFromUser = fromUserIdStr === currentUserId;
            const isToUser = toUserIdStr === currentUserId;
            
            if (!isFromUser && !isToUser) {
                console.log('❌ User not part of conversation');
                return { success: false, error: 'You are not part of this conversation' };
            }
            
            console.log('✅ User authorized');
            
            if (swapRequest.status !== 'accepted') {
                console.log('❌ Request not accepted, status:', swapRequest.status);
                return { success: false, error: 'Chat is only available for accepted swap requests' };
            }
            
            if (!data.message || data.message.trim().length === 0) {
                return { success: false, error: 'Message cannot be empty' };
            }
            
            if (data.message.length > 2000) {
                return { success: false, error: 'Message too long' };
            }

            // Determine the recipient automatically
            const toUserId = isFromUser ? toUserIdStr : fromUserIdStr;
            
            console.log('📤 Creating message from', currentUserId, 'to', toUserId);

            const message = await chatMessageRepository.create({
                swapRequestId: data.swapRequestId,
                fromUser: data.fromUserId,
                toUser: toUserId,
                message: data.message.trim()
            });

            console.log('✅ Message created:', message._id);
            return { success: true, message };
        } catch (error: any) {
            console.error('❌ sendMessage error:', error);
            return { success: false, error: error.message || 'Failed to send message' };
        }
    }

    async getChatHistory(swapRequestId: string, userId: string): Promise<{ success: boolean; messages?: IChatMessage[]; error?: string }> {
        try {
            console.log('📜 getChatHistory - swapRequestId:', swapRequestId, 'userId:', userId);
            
            const swapRequest = await swapRequestRepository.findById(swapRequestId);
            if (!swapRequest) {
                console.log('❌ Conversation not found');
                return { success: false, error: 'Conversation not found' };
            }

            // Handle both populated and non-populated user objects
            const fromUserIdStr = swapRequest.fromUser._id 
                ? swapRequest.fromUser._id.toString() 
                : swapRequest.fromUser.toString();
            const toUserIdStr = swapRequest.toUser._id 
                ? swapRequest.toUser._id.toString() 
                : swapRequest.toUser.toString();
            
            const currentUserId = userId.toString();
            
            console.log('🔍 Checking access:', {
                fromUserIdStr,
                toUserIdStr,
                currentUserId,
                isAuthorized: fromUserIdStr === currentUserId || toUserIdStr === currentUserId
            });
            
            const isAuthorized = fromUserIdStr === currentUserId || toUserIdStr === currentUserId;
            
            if (!isAuthorized) {
                console.log('❌ Access denied');
                return { success: false, error: 'Access denied' };
            }
            
            if (swapRequest.status !== 'accepted') {
                console.log('❌ Request not accepted');
                return { success: false, error: 'Chat is only available for accepted swap requests' };
            }

            const messages = await chatMessageRepository.getMessagesBySwapRequest(swapRequestId);
            await chatMessageRepository.markAsRead(swapRequestId, userId);

            console.log('✅ Loaded', messages.length, 'messages');
            return { success: true, messages };
        } catch (error: any) {
            console.error('❌ getChatHistory error:', error);
            return { success: false, error: error.message || 'Failed to load messages' };
        }
    }

    async getConversations(userId: string): Promise<IChatConversation[]> {
        try {
            console.log('🔄 Getting conversations for user:', userId);
            
            const acceptedInbox = await swapRequestRepository.getInbox(userId, 'accepted');
            const acceptedOutbox = await swapRequestRepository.getOutbox(userId, 'accepted');
            
            // Combine and remove duplicates by swapRequestId
            const allAccepted = [...acceptedInbox, ...acceptedOutbox];
            const uniqueAccepted = allAccepted.filter((request, index, self) => 
                index === self.findIndex(r => r._id.toString() === request._id.toString())
            );
            
            console.log('✅ Accepted requests found:', {
                inbox: acceptedInbox.length,
                outbox: acceptedOutbox.length,
                total: allAccepted.length,
                unique: uniqueAccepted.length
            });

            const conversations = await Promise.all(
                uniqueAccepted.map(async (request) => {
                    // Determine the other user - handle both populated and non-populated
                    const fromUserIdStr = request.fromUser._id 
                        ? request.fromUser._id.toString() 
                        : request.fromUser.toString();
                    const toUserIdStr = request.toUser._id 
                        ? request.toUser._id.toString() 
                        : request.toUser.toString();
                    
                    const isFromUser = fromUserIdStr === userId;
                    const otherUser = isFromUser ? request.toUser : request.fromUser;
                    
                    const messages = await chatMessageRepository.getMessagesBySwapRequest(request._id.toString());
                    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                    const unreadCount = await chatMessageRepository.getUnreadCountBySwapRequest(request._id.toString(), userId);

                    return {
                        swapRequestId: request._id.toString(),
                        otherUser: {
                            _id: (otherUser as any)._id?.toString() || otherUser.toString(),
                            name: (otherUser as any).name,
                            email: (otherUser as any).email,
                            avatar: (otherUser as any).profile?.avatar
                        },
                        lastMessage: lastMessage ? {
                            text: lastMessage.message,
                            fromMe: lastMessage.fromUser.toString() === userId,
                            timestamp: lastMessage.createdAt
                        } : undefined,
                        unreadCount,
                        skill: request.skillToTeach
                    };
                })
            );

            console.log('✅ Final unique conversations:', conversations.length);
            
            return conversations.sort((a, b) => {
                const timeA = a.lastMessage?.timestamp || new Date(0);
                const timeB = b.lastMessage?.timestamp || new Date(0);
                return new Date(timeB).getTime() - new Date(timeA).getTime();
            });

        } catch (error: any) {
            console.error('❌ Get conversations error:', error);
            return [];
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await chatMessageRepository.getUnreadCount(userId);
    }

    async canAccessChat(swapRequestId: string, userId: string): Promise<boolean> {
        try {
            const swapRequest = await swapRequestRepository.findById(swapRequestId);
            if (!swapRequest || swapRequest.status !== 'accepted') return false;
            
            const fromUserIdStr = swapRequest.fromUser._id 
                ? swapRequest.fromUser._id.toString() 
                : swapRequest.fromUser.toString();
            const toUserIdStr = swapRequest.toUser._id 
                ? swapRequest.toUser._id.toString() 
                : swapRequest.toUser.toString();
            
            return fromUserIdStr === userId || toUserIdStr === userId;
        } catch (error) {
            return false;
        }
    }

    async markConversationAsRead(swapRequestId: string, userId: string): Promise<void> {
        try {
            await chatMessageRepository.markAsRead(swapRequestId, userId);
        } catch (error) {
            console.error('❌ Mark as read error:', error);
        }
    }
}

export const chatMessageService = new ChatMessageService();