// app/router/swagger/session.swagger.ts
import { Router } from 'express';
import { sessionApiController } from '../../controllers/api/session.api.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/sessions/partners:
 *   get:
 *     tags: [Sessions]
 *     summary: Get learning partners
 *     description: Retrieve all accepted swap partners for the authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Partners retrieved successfully
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
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       profile:
 *                         type: object
 *       500:
 *         description: Error loading partners
 */
router.get('/partners', sessionApiController.getPartners);

/**
 * @swagger
 * /api/v1/sessions/log:
 *   post:
 *     tags: [Sessions]
 *     summary: Log a session
 *     description: Record a completed learning/teaching session with a partner
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *               - skill
 *               - hours
 *               - date
 *               - role
 *             properties:
 *               partnerId:
 *                 type: string
 *                 description: Partner's user ID
 *                 example: 507f1f77bcf86cd799439011
 *               skill:
 *                 type: string
 *                 description: Skill taught/learned
 *                 example: JavaScript
 *               hours:
 *                 type: number
 *                 description: Duration in hours
 *                 example: 2.5
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Session date
 *                 example: 2024-12-01
 *               role:
 *                 type: string
 *                 enum: [teacher, student]
 *                 description: Your role in the session
 *                 example: teacher
 *     responses:
 *       201:
 *         description: Session logged successfully
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
 *                   example: Session logged successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                     partnerId:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Validation error or missing required fields
 *       403:
 *         description: No accepted swap request with this user
 *       500:
 *         description: Error logging session
 */
router.post('/log', sessionApiController.logSession);

/**
 * @swagger
 * /api/v1/sessions/{sessionId}:
 *   get:
 *     tags: [Sessions]
 *     summary: Get session by ID
 *     description: Retrieve details of a specific session
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Session retrieved successfully
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
 *                     session:
 *                       type: object
 *                     userToRate:
 *                       type: object
 *                     canRate:
 *                       type: boolean
 *       403:
 *         description: Not authorized to view this session
 *       404:
 *         description: Session not found
 *       500:
 *         description: Failed to load session
 */
router.get('/:sessionId', sessionApiController.getSessionById);

/**
 * @swagger
 * /api/v1/sessions/{sessionId}/rate:
 *   post:
 *     tags: [Sessions]
 *     summary: Submit rating
 *     description: Submit a rating and review for a completed session
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *                 example: Great session! Very helpful and patient teacher.
 *     responses:
 *       200:
 *         description: Rating submitted successfully
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
 *                   example: Rating submitted successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     ratingId:
 *                       type: string
 *       400:
 *         description: Invalid rating or session already rated
 *       403:
 *         description: Not authorized to rate this session
 *       404:
 *         description: Session not found
 *       500:
 *         description: Failed to submit rating
 */
router.post('/:sessionId/rate', sessionApiController.submitRating);

/**
 * @swagger
 * /api/v1/sessions/history:
 *   get:
 *     tags: [Sessions]
 *     summary: Get session history
 *     description: Retrieve all sessions for the authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Session history retrieved successfully
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
 *                       teacher:
 *                         type: object
 *                       student:
 *                         type: object
 *                       skill:
 *                         type: string
 *                       hours:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       rated:
 *                         type: boolean
 *       500:
 *         description: Error loading sessions
 */
router.get('/history', sessionApiController.getSessionHistory);

/**
 * @swagger
 * /api/v1/sessions/balance:
 *   get:
 *     tags: [Sessions]
 *     summary: Get user balance
 *     description: Calculate hours taught vs learned balance for the authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Balance calculated successfully
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
 *                     totalSessions:
 *                       type: number
 *                       description: Total number of sessions
 *                     hoursTaught:
 *                       type: number
 *                       description: Total hours taught
 *                     hoursLearned:
 *                       type: number
 *                       description: Total hours learned
 *                     balance:
 *                       type: number
 *                       description: Balance (hoursTaught - hoursLearned)
 *       500:
 *         description: Error calculating balance
 */
router.get('/balance', sessionApiController.getUserBalance);

/**
 * @swagger
 * /api/v1/sessions/stats/dashboard:
 *   get:
 *     tags: [Sessions]
 *     summary: Get dashboard statistics
 *     description: Retrieve comprehensive session statistics for the authenticated user's dashboard
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalSessions:
 *                       type: number
 *                       example: 25
 *                     hoursTaught:
 *                       type: number
 *                       example: 30.5
 *                     hoursLearned:
 *                       type: number
 *                       example: 28.0
 *                     balance:
 *                       type: number
 *                       example: 2.5
 *                     completedSessions:
 *                       type: number
 *                       example: 25
 *       500:
 *         description: Error fetching statistics
 */
router.get('/stats/dashboard', sessionApiController.getDashboardStats);

export { router as sessionSwaggerRouter };