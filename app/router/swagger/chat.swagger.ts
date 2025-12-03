// app/router/swagger/chat.swagger.ts
import { Router } from 'express';
import { chatApiController } from '../../controllers/api/chat.api.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/chat/history/{swapRequestId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat history
 *     description: Retrieve all messages for a specific swap request conversation
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: swapRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap request ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       swapRequestId:
 *                         type: string
 *                       fromUser:
 *                         type: object
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       read:
 *                         type: boolean
 *       400:
 *         description: Failed to load chat history
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/history/:swapRequestId', chatApiController.getChatHistory);

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   get:
 *     tags: [Chat]
 *     summary: Get all conversations
 *     description: Retrieve all conversations for the authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       swapRequestId:
 *                         type: string
 *                       otherUser:
 *                         type: object
 *                       lastMessage:
 *                         type: object
 *                       unreadCount:
 *                         type: number
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/conversations', chatApiController.getConversations);

/**
 * @swagger
 * /api/v1/chat/send:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message
 *     description: Send a chat message in a conversation and emit via Socket.io
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - swapRequestId
 *               - message
 *             properties:
 *               swapRequestId:
 *                 type: string
 *                 description: Swap request ID
 *                 example: 507f1f77bcf86cd799439011
 *               message:
 *                 type: string
 *                 description: Message content
 *                 example: Hello! When are you available for our first session?
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     swapRequestId:
 *                       type: string
 *                     fromUser:
 *                       type: string
 *                     message:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or failed to send message
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.post('/send', chatApiController.sendMessage);

/**
 * @swagger
 * /api/v1/chat/unread-count:
 *   get:
 *     tags: [Chat]
 *     summary: Get unread message count
 *     description: Get the total number of unread messages for the authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 5
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/unread-count', chatApiController.getUnreadCount);

export { router as chatSwaggerRouter };