const { Router } = require('express');

const userController = require('../controllers/user');

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     responses:
 *       200:
 *         description: A list of users.
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /users:
 *   post:
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
 *               boss:
 *                 type: string
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
router.post('/', userController.registerUser);

/**
 * @swagger
 * /users/authenticate:
 *   post:
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
router.post('/authenticate', userController.authenticateUser);

module.exports = router;
