import { Document, Types } from 'mongoose';

export interface ISwapRequest extends Document {
    _id: Types.ObjectId;
    fromUser: Types.ObjectId;
    toUser: Types.ObjectId;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    message: string;
    skillToTeach: string;  
    skillToLearn: string;
    createdAt: Date;
    updatedAt: Date;
    respondedAt?: Date;
}