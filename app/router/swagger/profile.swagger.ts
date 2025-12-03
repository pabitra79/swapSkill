// app/router/swagger/profile.swagger.ts
import { Router } from 'express';
import { profileApiController } from '../../controllers/api/profile.api.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         bio:
 *                           type: string
 *                         teachSkills:
 *                           type: array
 *                           items:
 *                             type: string
 *                         learnSkills:
 *                           type: array
 *                           items:
 *                             type: string
 *                         availability:
 *                           type: string
 *                         location:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         language:
 *                           type: string
 *                         timezone:
 *                           type: string
 *                         experienceLevel:
 *                           type: string
 *                         hourlyRate:
 *                           type: number
 *                           nullable: true
 *                         website:
 *                           type: string
 *                         socialLinks:
 *                           type: object
 *                           properties:
 *                             github:
 *                               type: string
 *                             linkedin:
 *                               type: string
 *                             twitter:
 *                               type: string
 *       401:
 *         description: User not found
 *       500:
 *         description: Failed to load profile
 */
router.get('/', profileApiController.getProfile);

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Passionate developer with 5 years of experience
 *               teachSkills:
 *                 type: string
 *                 description: Comma-separated skills
 *                 example: JavaScript, Python, React
 *               learnSkills:
 *                 type: string
 *                 description: Comma-separated skills
 *                 example: Machine Learning, Go, Docker
 *               availability:
 *                 type: string
 *                 example: Weekends, 9 AM - 5 PM
 *               location:
 *                 type: string
 *                 example: New York, USA
 *               language:
 *                 type: string
 *                 example: English
 *               timezone:
 *                 type: string
 *                 example: EST
 *               experienceLevel:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced, Expert]
 *                 example: Intermediate
 *               hourlyRate:
 *                 type: number
 *                 example: 50
 *               website:
 *                 type: string
 *                 example: https://johndoe.com
 *               github:
 *                 type: string
 *                 example: https://github.com/johndoe
 *               linkedin:
 *                 type: string
 *                 example: https://linkedin.com/in/johndoe
 *               twitter:
 *                 type: string
 *                 example: https://twitter.com/johndoe
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully!
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: User not found
 *       500:
 *         description: Failed to update profile
 */
router.put('/', profileApiController.updateProfile);

/**
 * @swagger
 * /api/v1/profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload avatar
 *     description: Upload a new avatar image for the authenticated user
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (jpeg, jpg, png, gif, jfif) - Max 5MB
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
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
 *                   example: Avatar uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       example: /uploads/avatars/avatar-1234567890-123456789.jpg
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to upload avatar
 */
router.post('/avatar', profileApiController.uploadAvatar);

/**
 * @swagger
 * /api/v1/profile/view:
 *   get:
 *     tags: [Profile]
 *     summary: View own profile
 *     description: View the authenticated user's profile with statistics
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     userProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         profile:
 *                           type: object
 *                         stats:
 *                           type: object
 *                           properties:
 *                             completedSessions:
 *                               type: number
 *                             hoursTaught:
 *                               type: number
 *                             hoursLearned:
 *                               type: number
 *                             responseRate:
 *                               type: number
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     isOwnProfile:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: User not found
 *       500:
 *         description: Failed to load profile
 */
router.get('/view', profileApiController.viewProfile);

/**
 * @swagger
 * /api/v1/profile/view/{userId}:
 *   get:
 *     tags: [Profile]
 *     summary: View user profile by ID
 *     description: View any user's profile by their user ID
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     userProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         profile:
 *                           type: object
 *                         stats:
 *                           type: object
 *                           properties:
 *                             completedSessions:
 *                               type: number
 *                             hoursTaught:
 *                               type: number
 *                             hoursLearned:
 *                               type: number
 *                             responseRate:
 *                               type: number
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     isOwnProfile:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: User not found
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to load profile
 */
router.get('/view/:userId', profileApiController.viewProfile);

export { router as profileSwaggerRouter };