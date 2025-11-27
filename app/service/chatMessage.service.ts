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

            // Handle both populated and non-populated user objects
            const fromUserIdStr = swapRequest.fromUser._id 
                ? swapRequest.fromUser._id.toString() 
                : swapRequest.fromUser.toString();
            const toUserIdStr = swapRequest.toUser._id 
                ? swapRequest.toUser._id.toString() 
                : swapRequest.toUser.toString();
            
            const currentUserId = data.fromUserId.toString();
            
            const isFromUser = fromUserIdStr === currentUserId;
            const isToUser = toUserIdStr === currentUserId;
            
            if (!isFromUser && !isToUser) {
                console.log('❌ User not part of conversation');
                return { success: false, error: 'You are not part of this conversation' };
            }
            
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
            
            const isAuthorized = fromUserIdStr === currentUserId || toUserIdStr === currentUserId;
            
            if (!isAuthorized) {
                console.log('❌ Access denied');
                return { success: false, error: 'Access denied' };
            }
            
            if (swapRequest.status !== 'accepted') {
                console.log('❌ Request not accepted');
                return { success: false, error: 'Chat is only available for accepted swap requests' };
            }

            // Get the other user ID
            const otherUserId = fromUserIdStr === currentUserId ? toUserIdStr : fromUserIdStr;
            
            // Get ALL messages between these two users (across all swap requests)
            const allMessages = await this.getAllMessagesBetweenUsers(currentUserId, otherUserId);
            
            // Mark all as read
            await this.markAllAsReadBetweenUsers(currentUserId, otherUserId);

            console.log('✅ Loaded', allMessages.length, 'messages from all swap requests');
            return { success: true, messages: allMessages };
        } catch (error: any) {
            console.error('❌ getChatHistory error:', error);
            return { success: false, error: error.message || 'Failed to load messages' };
        }
    }

    // NEW: Get all messages between two users (across all swap requests)
    private async getAllMessagesBetweenUsers(userId1: string, userId2: string): Promise<IChatMessage[]> {
        // Get all swap request IDs between these users
        const swapRequestIds = await this.getSwapRequestIdsBetweenUsers(userId1, userId2);
        
        // Get messages from ALL swap requests
        const allMessages: IChatMessage[] = [];
        for (const swapRequestId of swapRequestIds) {
            const messages = await chatMessageRepository.getMessagesBySwapRequest(swapRequestId);
            allMessages.push(...messages);
        }
        
        // Sort by creation time
        return allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // NEW: Mark all messages as read between two users
    private async markAllAsReadBetweenUsers(userId1: string, userId2: string): Promise<void> {
        const swapRequestIds = await this.getSwapRequestIdsBetweenUsers(userId1, userId2);
        for (const swapRequestId of swapRequestIds) {
            await chatMessageRepository.markAsRead(swapRequestId, userId1);
        }
    }

    // NEW: Get all swap request IDs between two users
    async getSwapRequestIdsBetweenUsers(userId1: string, userId2: string): Promise<string[]> {
    const acceptedInbox = await swapRequestRepository.getInbox(userId1, 'accepted');
    const acceptedOutbox = await swapRequestRepository.getOutbox(userId1, 'accepted');
    const allAccepted = [...acceptedInbox, ...acceptedOutbox];
    
    const swapRequestIds: string[] = [];
    
    allAccepted.forEach(request => {
        const fromUserIdStr = request.fromUser._id 
            ? request.fromUser._id.toString() 
            : request.fromUser.toString();
        const toUserIdStr = request.toUser._id 
            ? request.toUser._id.toString() 
            : request.toUser.toString();
        
        // Check if this request is between userId1 and userId2
        if ((fromUserIdStr === userId1 && toUserIdStr === userId2) ||
            (fromUserIdStr === userId2 && toUserIdStr === userId1)) {
            swapRequestIds.push(request._id.toString());
        }
    });
    
    return swapRequestIds;
}

    async getConversations(userId: string): Promise<IChatConversation[]> {
        try {
            console.log('🔄 Getting conversations for user:', userId);
            
            const acceptedInbox = await swapRequestRepository.getInbox(userId, 'accepted');
            const acceptedOutbox = await swapRequestRepository.getOutbox(userId, 'accepted');
            
            const allAccepted = [...acceptedInbox, ...acceptedOutbox];
            
            console.log('✅ Accepted requests found:', {
                inbox: acceptedInbox.length,
                outbox: acceptedOutbox.length,
                total: allAccepted.length
            });

            // 🔥 CRITICAL FIX: Group by OTHER USER instead of by swap request
            const conversationMap = new Map<string, {
                swapRequests: any[];
                otherUserId: string;
                otherUserName: string;
                otherUserEmail: string;
                otherUserAvatar?: string;
                skills: string[];
            }>();

            allAccepted.forEach(request => {
                const fromUserIdStr = request.fromUser._id 
                    ? request.fromUser._id.toString() 
                    : request.fromUser.toString();
                const toUserIdStr = request.toUser._id 
                    ? request.toUser._id.toString() 
                    : request.toUser.toString();
                
                const isFromUser = fromUserIdStr === userId;
                const otherUser = isFromUser ? request.toUser : request.fromUser;
                const otherUserId = isFromUser ? toUserIdStr : fromUserIdStr;
                
                if (!conversationMap.has(otherUserId)) {
                    conversationMap.set(otherUserId, {
                        swapRequests: [],
                        otherUserId,
                        otherUserName: (otherUser as any).name,
                        otherUserEmail: (otherUser as any).email,
                        otherUserAvatar: (otherUser as any).profile?.avatar,
                        skills: []
                    });
                }
                
                const conv = conversationMap.get(otherUserId)!;
                conv.swapRequests.push(request);
                // Add both skills to show all skills exchanged
                conv.skills.push(request.skillToTeach, request.skillToLearn);
            });

            console.log('✅ Unique conversations (by person):', conversationMap.size);

            const conversations = await Promise.all(
                Array.from(conversationMap.values()).map(async (conv) => {
                    // Use the FIRST swap request ID as the primary conversation ID
                    const primarySwapRequest = conv.swapRequests[0];
                    const swapRequestId = primarySwapRequest._id.toString();
                    
                    // Get ALL messages between these users (across all swap requests)
                    const allMessages = await this.getAllMessagesBetweenUsers(userId, conv.otherUserId);
                    
                    const lastMessage = allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;
                    
                    // Calculate total unread count across all swap requests
                    let totalUnreadCount = 0;
                    for (const request of conv.swapRequests) {
                        const count = await chatMessageRepository.getUnreadCountBySwapRequest(request._id.toString(), userId);
                        totalUnreadCount += count;
                    }
                    
                    // Create unique skills list
                    const uniqueSkills = [...new Set(conv.skills)].join(', ');

                    return {
                        swapRequestId, // Use first swap request ID as the conversation identifier
                        otherUser: {
                            _id: conv.otherUserId,
                            name: conv.otherUserName,
                            email: conv.otherUserEmail,
                            avatar: conv.otherUserAvatar
                        },
                        lastMessage: lastMessage ? {
                            text: lastMessage.message,
                            fromMe: lastMessage.fromUser.toString() === userId,
                            timestamp: lastMessage.createdAt
                        } : undefined,
                        unreadCount: totalUnreadCount,
                        skill: uniqueSkills,
                        swapRequestCount: conv.swapRequests.length // Show how many swaps with this person
                    };
                })
            );

            console.log('✅ Final conversations (grouped by person):', conversations.length);
            
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
            // Get the other user from this swap request
            const swapRequest = await swapRequestRepository.findById(swapRequestId);
            if (!swapRequest) return;
            
            const fromUserIdStr = swapRequest.fromUser._id 
                ? swapRequest.fromUser._id.toString() 
                : swapRequest.fromUser.toString();
            const toUserIdStr = swapRequest.toUser._id 
                ? swapRequest.toUser._id.toString() 
                : swapRequest.toUser.toString();
            
            const otherUserId = fromUserIdStr === userId ? toUserIdStr : fromUserIdStr;
            
            // Mark ALL messages between these users as read
            await this.markAllAsReadBetweenUsers(userId, otherUserId);
        } catch (error) {
            console.error('❌ Mark as read error:', error);
        }
    }
}

export const chatMessageService = new ChatMessageService();