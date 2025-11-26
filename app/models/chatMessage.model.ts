import mongoose, { Schema } from 'mongoose';
import { IChatMessage } from '../interfaces/IchatMessage.interface';

const chatMessageSchema = new Schema<IChatMessage>(
    {
        swapRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'SwapRequest',
            required: true,
            index: true
        },
        fromUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        toUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

chatMessageSchema.index({ swapRequestId: 1, createdAt: -1 });
chatMessageSchema.index({ toUser: 1, isRead: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
