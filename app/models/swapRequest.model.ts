import { Schema, model } from 'mongoose';
import { ISwapRequest } from '../interfaces/IswapRequest.interface';

const swapRequestSchema = new Schema<ISwapRequest>({
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    skillToTeach: {
        type: String,
        required: true
    },
    skillToLearn: {
        type: String,
        required: true
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

swapRequestSchema.index({ fromUser: 1, toUser: 1, status: 1 });
swapRequestSchema.index({ toUser: 1, status: 1 });

export const SwapRequest = model<ISwapRequest>('SwapRequest', swapRequestSchema);