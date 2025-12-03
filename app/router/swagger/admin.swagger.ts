// app/router/swagger/admin.swagger.ts
import { Router } from 'express';
import { adminApiController } from '../../controllers/api/admin.api.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard
 *     description: Retrieve platform statistics, recent activities, and top skills
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     verifiedUsers:
 *                       type: number
 *                     totalSessions:
 *                       type: number
 *                     totalHours:
 *                       type: number
 *                     totalSwapRequests:
 *                       type: number
 *                     acceptedSwaps:
 *                       type: number
 *                 activities:
 *                   type: object
 *                   properties:
 *                     recentUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recentSessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                 topSkills:
 *                   type: object
 *                   properties:
 *                     topTeach:
 *                       type: array
 *                       items:
 *                         type: string
 *                     topLearn:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/dashboard', adminApiController.getDashboard);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     description: Retrieve list of all users in the platform
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   isVerified:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/users', adminApiController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user details
 *     description: Retrieve detailed information about a specific user
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 profile:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:userId', adminApiController.getUserDetails);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user
 *     description: Delete a user from the platform (cannot delete own account)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:userId', adminApiController.deleteUser);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform statistics
 *     description: Retrieve overall platform statistics
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
 *                 totalUsers:
 *                   type: number
 *                 verifiedUsers:
 *                   type: number
 *                 totalSessions:
 *                   type: number
 *                 totalHours:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get('/stats', adminApiController.getStats);

/**
 * @swagger
 * /api/v1/admin/users/search:
 *   get:
 *     tags: [Admin]
 *     summary: Search users
 *     description: Search for users by name or email
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Search query required
 *       500:
 *         description: Server error
 */
router.get('/users/search', adminApiController.searchUsers);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     tags: [Admin]
 *     summary: Admin logout
 *     description: Logout admin user and destroy session
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       302:
 *         description: Redirect to login page
 *       500:
 *         description: Logout failed
 */
router.post('/logout', adminApiController.adminLogout);

export { router as adminSwaggerRouter };