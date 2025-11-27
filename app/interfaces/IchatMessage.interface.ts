import { Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
    _id: Types.ObjectId;
    swapRequestId: Types.ObjectId;
    fromUser: Types.ObjectId;
    toUser: Types.ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChatConversation {
    swapRequestId: string;
    otherUser: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    lastMessage?: {
        text: string;
        timestamp: Date;
        fromMe: boolean;
    };
    unreadCount: number;
    skill: string;
    swapRequestCount?: number;//add new
}