// src/config/socket.config.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { chatMessageService } from '../service/chatMessage.service';
import { swapRequestRepository } from '../repository/swapRequest.repository';

export function initializeSocket(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log('🔌 Socket connected:', socket.id);

        socket.on('authenticate', (data: { userId: string }) => {
            console.log('👤 User authenticated:', data.userId, 'Socket:', socket.id);
        });

        socket.on('join_chat', (swapRequestId: string) => {
            const roomName = `chat_${swapRequestId}`;
            socket.join(roomName);
            console.log(`📥 Socket ${socket.id} joined room: ${roomName}`);
        });

        socket.on('send_message', async (data: {
            swapRequestId: string;
            fromUserId: string;
            message: string;
        }) => {
            console.log('📤 send_message received:', data);
            
            try {
                const result = await chatMessageService.sendMessage(data);

                if (result.success && result.message) {
                    console.log('✅ Message saved, broadcasting...');
                    
                    // Get the swap request to find the other user
                    const swapRequest = await swapRequestRepository.findById(data.swapRequestId);
                    if (swapRequest) {
                        const fromUserIdStr = swapRequest.fromUser._id 
                            ? swapRequest.fromUser._id.toString() 
                            : swapRequest.fromUser.toString();
                        const toUserIdStr = swapRequest.toUser._id 
                            ? swapRequest.toUser._id.toString() 
                            : swapRequest.toUser.toString();
                        
                        const otherUserId = fromUserIdStr === data.fromUserId ? toUserIdStr : fromUserIdStr;
                        
                        // Get ALL swap request IDs between these users using the service method
                        const allSwapRequestIds = await chatMessageService.getSwapRequestIdsBetweenUsers(data.fromUserId, otherUserId);
                        
                        console.log(`📦 Broadcasting to ${allSwapRequestIds.length} swap requests between users`);
                        
                        // Broadcast to ALL rooms (all swap requests between these users)
                        allSwapRequestIds.forEach(swapId => {
                            const room = `chat_${swapId}`;
                            io.to(room).emit('new_message', {
                                _id: result.message!._id,
                                swapRequestId: swapId,
                                fromUser: result.message!.fromUser,
                                message: result.message!.message,
                                createdAt: result.message!.createdAt,
                                isRead: false
                            });
                            console.log(`📢 Broadcast to room: ${room}`);
                        });
                    }
                    
                } else {
                    console.error('❌ Failed to save message:', result.error);
                    socket.emit('message_error', { error: result.error || 'Unknown error' });
                }
            } catch (error) {
                console.error('❌ send_message error:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected:', socket.id);
        });
    });

    console.log('✅ Socket.io initialized');
    return io;
}