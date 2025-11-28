import mongoose from 'mongoose';
import { SwapRequest } from '../models/swapRequest.model';
import { ISwapRequest } from '../interfaces/IswapRequest.interface';

export class SwapRequestRepository {

    async create(data: Partial<ISwapRequest>): Promise<ISwapRequest> {
        console.log('Repository create - Raw data:', data);
        
        try {
            const requestData = {
                ...data,
                fromUser: new mongoose.Types.ObjectId(data.fromUser as any),
                toUser: new mongoose.Types.ObjectId(data.toUser as any)
            };
            
            console.log(' Repository create - Converted data:', requestData);
            
            const request = await SwapRequest.create(requestData);
            console.log(' Repository create - Success! ID:', request._id);
            return request;
        } catch (error) {
            console.error(' Repository create - Error:', error);
            throw error;
        }
    }

    // Find request by ID
    async findById(id: string): Promise<ISwapRequest | null> {
        return await SwapRequest.findById(id)
            .populate('fromUser', 'name email profile')
            .populate('toUser', 'name email profile');
    }


    async findExisting(fromUserId: string, toUserId: string): Promise<ISwapRequest | null> {
        console.log(' Repository findExisting - From:', fromUserId, 'To:', toUserId);
        const result = await SwapRequest.findOne({
            fromUser: new mongoose.Types.ObjectId(fromUserId),
            toUser: new mongoose.Types.ObjectId(toUserId),
            status: { $in: ['pending', 'accepted'] }
        });
        console.log(' Repository findExisting - Found:', result ? 'Yes' : 'No');
        return result;
    }

    async getInbox(userId: string, status?: string): Promise<ISwapRequest[]> {
        console.log(' Repository getInbox - userId:', userId);
        
        const query: any = { toUser: new mongoose.Types.ObjectId(userId) };
        
        if (status && status !== 'all') {
            query.status = status;
        }

        console.log('Repository query:', query);

        const requests = await SwapRequest.find(query)
            .populate('fromUser', 'name email profile')
            .sort({ createdAt: -1 });
        
        console.log(' Repository found:', requests.length, 'requests');
        
        return requests;
    }


    async getOutbox(userId: string, status?: string): Promise<ISwapRequest[]> {
        const query: any = { fromUser: new mongoose.Types.ObjectId(userId) };
        
        if (status && status !== 'all') {
            query.status = status;
        }

        return await SwapRequest.find(query)
            .populate('toUser', 'name email profile')
            .sort({ createdAt: -1 });
    }
    async findPendingByIdAndRecipient(requestId: string, userId: string): Promise<ISwapRequest | null> {
        return await SwapRequest.findOne({
            _id: requestId,
            toUser: new mongoose.Types.ObjectId(userId),
            status: 'pending'
        }).populate('fromUser', 'name email profile');
    }


    async findPendingByIdAndSender(requestId: string, userId: string): Promise<ISwapRequest | null> {
        return await SwapRequest.findOne({
            _id: requestId,
            fromUser: new mongoose.Types.ObjectId(userId),
            status: 'pending'
        });
    }


    async updateStatus(requestId: string, status: ISwapRequest['status']): Promise<ISwapRequest | null> {
        const updateData: any = { status };
        
        if (status === 'accepted' || status === 'declined') {
            updateData.respondedAt = new Date();
        }

        return await SwapRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true }
        );
    }

    async countPending(userId: string): Promise<number> {
        return await SwapRequest.countDocuments({
            toUser: new mongoose.Types.ObjectId(userId),
            status: 'pending'
        });
    }

    async getRequestsBetweenUsers(userId1: string, userId2: string): Promise<ISwapRequest[]> {
        const user1ObjectId = new mongoose.Types.ObjectId(userId1);
        const user2ObjectId = new mongoose.Types.ObjectId(userId2);
        
        return await SwapRequest.find({
            $or: [
                { fromUser: user1ObjectId, toUser: user2ObjectId },
                { fromUser: user2ObjectId, toUser: user1ObjectId }
            ]
        }).sort({ createdAt: -1 });
    }


    async delete(requestId: string): Promise<boolean> {
        const result = await SwapRequest.findByIdAndDelete(requestId);
        return !!result;
    }
    async getAcceptedSwaps(userId: string) {
  return await SwapRequest.find({
    $or: [
      { fromUser: userId, status: 'accepted' },
      { toUser: userId, status: 'accepted' }
    ]
  }).populate('fromUser toUser', 'name email');
}

    async checkSwapExists(userId: string, partnerId: string): Promise<boolean> {
  const swap = await SwapRequest.findOne({
    $or: [
      { fromUser: userId, toUser: partnerId, status: 'accepted' },
      { fromUser: partnerId, toUser: userId, status: 'accepted' }
    ]
  });
  
  return swap !== null;
}
}

export const swapRequestRepository = new SwapRequestRepository();