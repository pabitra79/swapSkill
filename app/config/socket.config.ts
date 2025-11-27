// src/config/socket.config.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { chatMessageService } from '../service/chatMessage.service';

// Store online users: userId -> socketId
const onlineUsers = new Map<string, string>();

export function initializeSocket(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*', // Allow all origins for development
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'], // Support both WebSocket and polling
        allowEIO3: true
    });

    io.on('connection', (socket) => {
        console.log('🔌 Socket connected:', socket.id);

        // User authenticates and connects
        socket.on('authenticate', (data: { userId: string }) => {
            const userId = data.userId;
            console.log('👤 User authenticated:', userId, 'Socket:', socket.id);
            onlineUsers.set(userId, socket.id);
            
            // Notify all clients about online user
            io.emit('user_online', userId);
        });

        // User joins a chat room
        socket.on('join_chat', (swapRequestId: string) => {
            socket.join(`chat_${swapRequestId}`);
            console.log(`📥 Socket ${socket.id} joined room: chat_${swapRequestId}`);
        });

        // User sends a message
        socket.on('send_message', async (data: {
            swapRequestId: string;
            fromUserId: string;
            message: string;
        }) => {
            console.log('📤 send_message event received:', data);

            try {
                const result = await chatMessageService.sendMessage(data);

                if (result.success && result.message) {
                    console.log('✅ Message saved, broadcasting to room: chat_' + data.swapRequestId);
                    
                    // Broadcast to EVERYONE in the room (including sender)
                    io.to(`chat_${data.swapRequestId}`).emit('new_message', {
                        _id: result.message._id,
                        swapRequestId: data.swapRequestId,
                        fromUser: result.message.fromUser,
                        message: result.message.message,
                        createdAt: result.message.createdAt,
                        isRead: false
                    });
                    
                    console.log('✅ Message broadcast complete');
                } else {
                    console.error('❌ Failed to save message:', result.error);
                    socket.emit('message_error', { error: result.error });
                }
            } catch (error) {
                console.error('❌ send_message error:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // User is typing
        socket.on('typing', (data: { swapRequestId: string; userId: string; userName: string }) => {
            socket.to(`chat_${data.swapRequestId}`).emit('user_typing', {
                userId: data.userId,
                userName: data.userName
            });
        });

        // User stopped typing
        socket.on('stop_typing', (data: { swapRequestId: string; userId: string }) => {
            socket.to(`chat_${data.swapRequestId}`).emit('user_stopped_typing', {
                userId: data.userId
            });
        });

        // User disconnects
        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected:', socket.id);
            
            // Remove from online users
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit('user_offline', userId);
                    console.log('👤 User went offline:', userId);
                    break;
                }
            }
        });
    });

    console.log('✅ Socket.io initialized with CORS enabled');
    return io;
}

export function isUserOnline(userId: string): boolean {
    return onlineUsers.has(userId);
}

export function getOnlineUsers(): string[] {
    return Array.from(onlineUsers.keys());
}