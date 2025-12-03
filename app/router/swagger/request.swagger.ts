// app/router/swagger/request.swagger.ts
import { Router } from 'express';
import { requestApiController } from '../../controllers/api/request.api.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/requests/inbox:
 *   get:
 *     tags: [Requests]
 *     summary: Get inbox requests
 *     description: Retrieve all swap requests received by the authenticated user
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, accepted, declined]
 *           default: all
 *         description: Filter requests by status
 *     responses:
 *       200:
 *         description: Inbox requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pendingCount:
 *                       type: number
 *                     currentStatus:
 *                       type: string
 *       500:
 *         description: Failed to load requests
 */
router.get('/inbox', requestApiController.getInbox);

/**
 * @swagger
 * /api/v1/requests/outbox:
 *   get:
 *     tags: [Requests]
 *     summary: Get outbox requests
 *     description: Retrieve all swap requests sent by the authenticated user
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, accepted, declined, cancelled]
 *           default: all
 *         description: Filter requests by status
 *     responses:
 *       200:
 *         description: Outbox requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pendingCount:
 *                       type: number
 *                     currentStatus:
 *                       type: string
 *       500:
 *         description: Failed to load sent requests
 */
router.get('/outbox', requestApiController.getOutbox);

/**
 * @swagger
 * /api/v1/requests/send:
 *   post:
 *     tags: [Requests]
 *     summary: Send swap request
 *     description: Send a new skill swap request to another user
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toUserId
 *               - skillToTeach
 *               - skillToLearn
 *               - message
 *             properties:
 *               toUserId:
 *                 type: string
 *                 description: ID of the user to send request to
 *                 example: 507f1f77bcf86cd799439011
 *               skillToTeach:
 *                 type: string
 *                 description: Skill you want to teach
 *                 example: JavaScript
 *               skillToLearn:
 *                 type: string
 *                 description: Skill you want to learn
 *                 example: Python
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 description: Message to the user (minimum 10 characters)
 *                 example: Hi! I'd love to exchange JavaScript for Python. I have 5 years of experience.
 *     responses:
 *       201:
 *         description: Request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or request failed
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to send request
 */
router.post('/send', requestApiController.sendRequest);

/**
 * @swagger
 * /api/v1/requests/{requestId}/accept:
 *   post:
 *     tags: [Requests]
 *     summary: Accept swap request
 *     description: Accept a received swap request
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap request ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Failed to accept request
 *       500:
 *         description: Server error
 */
router.post('/:requestId/accept', requestApiController.acceptRequest);

/**
 * @swagger
 * /api/v1/requests/{requestId}/decline:
 *   post:
 *     tags: [Requests]
 *     summary: Decline swap request
 *     description: Decline a received swap request
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap request ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Failed to decline request
 *       500:
 *         description: Server error
 */
router.post('/:requestId/decline', requestApiController.declineRequest);

/**
 * @swagger
 * /api/v1/requests/{requestId}/cancel:
 *   post:
 *     tags: [Requests]
 *     summary: Cancel swap request
 *     description: Cancel a sent swap request
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap request ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Failed to cancel request
 *       500:
 *         description: Server error
 */
router.post('/:requestId/cancel', requestApiController.cancelRequest);

/**
 * @swagger
 * /api/v1/requests/connection/{userId2}:
 *   get:
 *     tags: [Requests]
 *     summary: Check connection status
 *     description: Check if there's an existing connection or request with another user
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: string
 *         description: Other user's ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Connection status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hasConnection:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [none, pending, accepted]
 *       500:
 *         description: Failed to check connection status
 */
router.get('/connection/:userId2', requestApiController.checkConnection);

/**
 * @swagger
 * /api/v1/requests/{requestId}:
 *   get:
 *     tags: [Requests]
 *     summary: Get request by ID
 *     description: Retrieve details of a specific swap request
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Swap request ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Request retrieved successfully
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
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 *       500:
 *         description: Failed to get request
 */
router.get('/:requestId', requestApiController.getRequestById);

export { router as requestSwaggerRouter };