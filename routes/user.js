const { Router } = require('express');

const { userController } = require('#controllers');
const {
  userRegistration,
  userAuthentication,
  userBossChange,
  authenticate,
  validate,
} = require('#middleware');

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User Data Access
 *     summary: Retrieve a list of users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, userController.getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - User Management
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['Administrator', 'Boss', 'Regular User']
 *                 description: Defaults to 'Regular User'
 *               bossId:
 *                 type: string
 *                 description: ObjectId of the boss user
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', validate(userRegistration), userController.registerUser);

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     tags:
 *       - User Authentication and Session Management
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: User authenticated
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post(
  '/authenticate',
  validate(userAuthentication),
  userController.authenticateUser,
);

/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     tags:
 *       - User Management
 *     summary: Change the boss of a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bossId:
 *                 type: string
 *                 description: The id of the new boss
 *             required:
 *               - bossId
 *     responses:
 *       200:
 *         description: The user's boss was successfully updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/:userId',
  validate(userBossChange),
  authenticate,
  userController.changeBoss,
);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     tags:
 *       - User Authentication and Session Management
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', userController.refreshToken);

module.exports = router;
