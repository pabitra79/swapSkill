// app/router/swagger/auth.swagger.ts
import { Router } from 'express';
import { authApiController } from '../../controllers/api/auth.api.controller';
import { authController } from '../../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   get:
 *     tags: [Authentication]
 *     summary: Show registration form
 *     description: Display user registration page
 *     responses:
 *       200:
 *         description: Registration form rendered
 */
// No GET route needed for API - only POST

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user
 *     description: Create a new user account and send verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authApiController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   get:
 *     tags: [Authentication]
 *     summary: Show login form
 *     description: Display login page
 *     responses:
 *       200:
 *         description: Login form rendered
 */
// No GET route needed for API - only POST

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and create session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Session cookie
 *             schema:
 *               type: string
 *       302:
 *         description: Redirect to dashboard or admin dashboard based on role
 *       400:
 *         description: Invalid credentials or unverified email
 *       500:
 *         description: Server error
 */
router.post('/login', authApiController.login);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify email
 *     description: Verify user email with token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/verify-email', authApiController.verifyEmail);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   get:
 *     tags: [Authentication]
 *     summary: Show forgot password form
 *     description: Display forgot password page
 *     responses:
 *       200:
 *         description: Forgot password form rendered
 */
// No GET route needed for API

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset email sent (or email doesn't exist - security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', authApiController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   get:
 *     tags: [Authentication]
 *     summary: Show reset password page
 *     description: Display password reset form
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     responses:
 *       200:
 *         description: Reset password form rendered
 */
// No GET route needed for API

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password
 *     description: Update user password with reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *       400:
 *         description: Invalid token or validation error
 *       500:
 *         description: Server error
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user, destroy session and broadcast to other tabs
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       302:
 *         description: Redirect to login page
 *       500:
 *         description: Logout failed
 */
router.post('/logout', authController.logout);

export { router as authSwaggerRouter };