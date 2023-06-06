const { Router } = require('express');

const visualizeController = require('../controllers/visualize');

const router = Router();

/**
 * @swagger
 * /visualize:
 *   get:
 *     summary: Retrieve the user hierarchy (only for testing purposes)
 *     responses:
 *       200:
 *         description: User hierarchy successfully retrieved
 *       500:
 *         description: Internal server error
 */
router.get('/', visualizeController.printHierarchy);

module.exports = router;
