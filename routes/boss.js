const { Router } = require('express');

const bossController = require('../controllers/boss');

const router = Router();

router.get('/:bossId/users/:userId', bossController.changeUserBoss);

module.exports = router;
