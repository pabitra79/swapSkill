// app/controllers/api/request.api.controller.ts
import { Request, Response } from 'express';
import { swapRequestService } from '../../service/swapRequest.service';

class RequestApiController {
    private getUserId(req: Request): string {
        if (req.user && req.user._id) {
            return req.user._id;
        }
        throw new Error('User not authenticated');
    }
    
    async getInbox(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const status = req.query.status as string || 'all';

            const requests = await swapRequestService.getInbox(userId, status);
            const pendingCount = await swapRequestService.getPendingCount(userId);

            res.json({
                success: true,
                data: {
                    requests,
                    pendingCount,
                    currentStatus: status
                }
            });
        } catch (error) {
            console.error('Get inbox error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load requests'
            });
        }
    }

    async sendRequest(req: Request, res: Response) {
        try {
            const fromUserId = this.getUserId(req);
            const { toUserId, skillToTeach, skillToLearn, message } = req.body;

            if (!toUserId || !skillToTeach || !skillToLearn || !message) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'All fields are required' 
                });
            }

            if (message.length < 10) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Message must be at least 10 characters long' 
                });
            }

            const result = await swapRequestService.sendRequest(fromUserId, {
                toUserId,
                skillToTeach,
                skillToLearn,
                message
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error: any) {
            console.error('Send request error:', error);
            
            if (error.message.includes('authenticated')) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Authentication required. Please log in again.' 
                });
            }
            
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send request. Please try again.' 
            });
        }
    }

    async getOutbox(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const status = req.query.status as string || 'all';
            
            const requests = await swapRequestService.getOutbox(userId, status);
            const pendingCount = await swapRequestService.getPendingCount(userId);
            
            res.json({
                success: true,
                data: {
                    requests,
                    pendingCount,
                    currentStatus: status
                }
            });
        } catch (error) {
            console.error('Get outbox error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load sent requests'
            });
        }
    }

    async acceptRequest(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { requestId } = req.params;

            const result = await swapRequestService.acceptRequest(requestId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Accept request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to accept request'
            });
        }
    }

    async declineRequest(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { requestId } = req.params;

            const result = await swapRequestService.declineRequest(requestId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Decline request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to decline request'
            });
        }
    }

    async cancelRequest(req: Request, res: Response) {
        try {
            const userId = this.getUserId(req);
            const { requestId } = req.params;

            const result = await swapRequestService.cancelRequest(requestId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Cancel request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to cancel request'
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
            console.error('Check connection error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check connection status'
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
                    error: 'Request not found'
                });
            }

            if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: request
            });
        } catch (error) {
            console.error('Get request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get request'
            });
        }
    }
}

export const requestApiController = new RequestApiController();