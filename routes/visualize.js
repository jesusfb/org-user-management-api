const { Router } = require('express');

const { visualizeController } = require('#controllers');

const router = Router();

/**
 * @swagger
 * /visualize:
 *   get:
 *     tags:
 *       - System Monitoring or Debugging
 *     summary: Retrieve the user hierarchy (only for testing purposes)
 *     responses:
 *       200:
 *         description: User hierarchy successfully retrieved
 *       500:
 *         description: Internal server error
 */
router.get('/', visualizeController.printHierarchy);

module.exports = router;
