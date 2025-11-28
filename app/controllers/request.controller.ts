import { Request, Response } from 'express';
import { swapRequestService } from '../service/swapRequest.service';
import { userRepository } from '../repository/user.repository';

export class RequestController {
    constructor() {
        this.getInbox = this.getInbox.bind(this);
        this.getOutbox = this.getOutbox.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.declineRequest = this.declineRequest.bind(this);
        this.cancelRequest = this.cancelRequest.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.getRequestById = this.getRequestById.bind(this);
    }

    private getUserId(req: Request): string {
        console.log(' User debug:', {
            hasUser: !!req.user,
            userId: req.user?._id,
            userEmail: req.user?.email
        });

        if (req.user && req.user._id) {
            return req.user._id;
        }
        
        throw new Error('User not authenticated - No user found in request');
    }
    
    async getInbox(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const status = req.query.status as string || 'all';

            console.log(' getInbox - User ID:', userId);

            const requests = await swapRequestService.getInbox(userId, status);
            const pendingCount = await swapRequestService.getPendingCount(userId);

            res.render('pages/request/inbox', {
                title: 'Received Requests - SkillSwap',
                requests,
                pendingCount,
                currentStatus: status,
                user: req.user,  // Add this for navbar
            currentUser: req.user // Add this for consistency
            });
        } catch (error) {
            console.error('Get inbox error:', error);
            res.status(500).render('error', {
                title: 'Error - SkillSwap',
                message: 'Failed to load requests'
            });
        }
    }

    // Send swap request
    async sendRequest(req: Request, res: Response) {
        try {
            const fromUserId = this.getUserId(req);
            const { toUserId, skillToTeach, skillToLearn, message } = req.body;

            console.log(' sendRequest - Authenticated User:', fromUserId);
            console.log(' sendRequest - Data:', { 
                toUserId, 
                skillToTeach, 
                skillToLearn, 
                message: message?.substring(0, 50) + '...' 
            });

            // Validation
            if (!toUserId || !skillToTeach || !skillToLearn || !message) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required' 
                });
            }

            if (message.length < 10) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Message must be at least 10 characters long' 
                });
            }

            const result = await swapRequestService.sendRequest(fromUserId, {
                toUserId,
                skillToTeach,
                skillToLearn,
                message
            });

            console.log(' sendRequest - Result:', result.success, result.message);

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error: any) {
            console.error(' Send request error:', error);
            
            
            if (error.message.includes('authenticated')) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required. Please log in again.' 
                });
            }
            
            res.status(500).json({ 
                success: false, 
                message: 'Failed to send request. Please try again.' 
            });
        }
    }

    async getOutbox(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const status = req.query.status as string || 'all';
            
            console.log(' getOutbox - User ID:', userId);
            
            const requests = await swapRequestService.getOutbox(userId, status);
            const pendingCount = await swapRequestService.getPendingCount(userId);
            
            console.log(' getOutbox - Found requests:', requests.length);
            
            res.render('pages/request/outbox', {
                title: 'Sent Requests - SkillSwap',
                requests,
                pendingCount,
                currentStatus: status,
                user: req.user,  
                currentUser: req.user 
            });
        } catch (error) {
            console.error(' Get outbox error:', error);
            res.status(500).render('error', {
                title: 'Error - SkillSwap',
                message: 'Failed to load sent requests'
            });
        }
    }

    async acceptRequest(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { requestId } = req.params;

            console.log(' acceptRequest - User:', userId, 'Request:', requestId);

            const result = await swapRequestService.acceptRequest(requestId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error(' Accept request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to accept request'
            });
        }
    }

    async declineRequest(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { requestId } = req.params;

            console.log(' declineRequest - User:', userId, 'Request:', requestId);

            const result = await swapRequestService.declineRequest(requestId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error(' Decline request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to decline request'
            });
        }
    }
    async cancelRequest(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { requestId } = req.params;

            console.log(' cancelRequest - User:', userId, 'Request:', requestId);

            const result = await swapRequestService.cancelRequest(requestId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error(' Cancel request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel request'
            });
        }
    }

    async checkConnection(req: Request, res: Response) {
        try {
            const userId1 = this.getUserId(req);
            const { userId2 } = req.params;

            const result = await swapRequestService.checkConnectionStatus(userId1, userId2);

            res.json(result);
        } catch (error) {
            console.error(' Check connection error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check connection status'
            });
        }
    }

    async getRequestById(req: Request, res: Response) {
        try {
            const { requestId } = req.params;
            const userId = this.getUserId(req);

            const request = await swapRequestService.getRequestById(requestId);
            
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                request
            });
        } catch (error) {
            console.error(' Get request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get request'
            });
        }
    }
}

export const requestController = new RequestController();