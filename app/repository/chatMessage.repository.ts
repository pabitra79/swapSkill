// src/repository/chatMessage.repository.ts
import mongoose from 'mongoose';
import { ChatMessage } from '../models/chatMessage.model';
import { IChatMessage } from '../interfaces/IchatMessage.interface';

export class ChatMessageRepository {
    
    // Create a new message
    async create(data: {
    swapRequestId: string;
    fromUser: string;
    toUser: string;  
    message: string;
}): Promise<IChatMessage> {
    const messageData = {
        swapRequestId: new mongoose.Types.ObjectId(data.swapRequestId),
        fromUser: new mongoose.Types.ObjectId(data.fromUser),
        toUser: new mongoose.Types.ObjectId(data.toUser),
        message: data.message,
        isRead: false
    };

    const message = await ChatMessage.create(messageData);
    return await message.populate('fromUser', 'name email profile');
}

    // Get messages for a swap request
    async getMessagesBySwapRequest(
        swapRequestId: string,
        limit: number = 50
    ): Promise<IChatMessage[]> {
        return await ChatMessage.find({
        swapRequestId: new mongoose.Types.ObjectId(swapRequestId)
        })
        .populate('fromUser', 'name email profile')
        .populate('toUser', 'name email profile')
        .sort({ createdAt: 1 })
        .limit(limit);
    }

    // Mark messages as read
    async markAsRead(swapRequestId: string, userId: string): Promise<void> {
        await ChatMessage.updateMany(
            {
                swapRequestId: new mongoose.Types.ObjectId(swapRequestId),
                toUser: new mongoose.Types.ObjectId(userId),
                isRead: false
            },
            {
                isRead: true
            }
        );
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await ChatMessage.countDocuments({
            toUser: new mongoose.Types.ObjectId(userId),
            isRead: false
        });
    }

    // Get unread count per conversation
    async getUnreadCountBySwapRequest(
        swapRequestId: string,
        userId: string
    ): Promise<number> {
        return await ChatMessage.countDocuments({
            swapRequestId: new mongoose.Types.ObjectId(swapRequestId),
            toUser: new mongoose.Types.ObjectId(userId),
            isRead: false
        });
    }

async getConversations(userId: string): Promise<any[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const conversations = await ChatMessage.aggregate([
        {
            $match: {
                $or: [
                    { fromUser: userObjectId },
                    { toUser: userObjectId }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: '$swapRequestId',
                lastMessage: { $first: '$message' },
                lastMessageTime: { $first: '$createdAt' },
                lastMessageFromUser: { $first: '$fromUser' }, 
                toUser: { $first: '$toUser' }
            }
        },
        {
            $lookup: {
                from: 'swaprequests',
                localField: '_id',
                foreignField: '_id',
                as: 'swapRequest'
            }
        },
        {
            $unwind: {
                path: '$swapRequest',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { lastMessageTime: -1 }
        }
    ]);

    return conversations;
}

    async deleteBySwapRequest(swapRequestId: string): Promise<void> {
        await ChatMessage.deleteMany({
            swapRequestId: new mongoose.Types.ObjectId(swapRequestId)
        });
    }
    async findById(messageId: string): Promise<IChatMessage | null> {
    return await ChatMessage.findById(messageId)
        .populate('fromUser', 'name email profile');
}
}

export const chatMessageRepository = new ChatMessageRepository();