// app/router/swagger/browse.swagger.ts
import { Router } from 'express';
import { browseApiController } from '../../controllers/api/browse.api.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/browse:
 *   get:
 *     tags: [Browse]
 *     summary: Browse users
 *     description: Get a list of all users with match scores, with optional filtering and sorting
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by skill name or user name
 *         example: JavaScript
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *         example: New York
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced, Expert]
 *         description: Filter by experience level
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [match, newest, name]
 *           default: match
 *         description: Sort users by match score, newest first, or alphabetically
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               profile:
 *                                 type: object
 *                           matchScore:
 *                             type: number
 *                           matchedSkills:
 *                             type: array
 *                             items:
 *                               type: string
 *                     totalUsers:
 *                       type: integer
 *                     filters:
 *                       type: object
 *                       properties:
 *                         locations:
 *                           type: array
 *                           items:
 *                             type: string
 *                         experienceLevels:
 *                           type: array
 *                           items:
 *                             type: string
 *                     appliedFilters:
 *                       type: object
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/', browseApiController.browseUsers);

/**
 * @swagger
 * /api/v1/browse/skills/search:
 *   get:
 *     tags: [Browse]
 *     summary: Search skills
 *     description: Search for skills across all user profiles (autocomplete)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *         example: Java
 *     responses:
 *       200:
 *         description: Matching skills found
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
 *                     type: string
 *                   example: ["JavaScript", "Java", "JavaFX"]
 *       500:
 *         description: Server error
 */
router.get('/skills/search', browseApiController.searchSkills);

export { router as browseSwaggerRouter };