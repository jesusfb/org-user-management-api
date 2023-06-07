const { Router } = require('express');

const { bossController } = require('#controllers');

const router = Router();

router.get('/:bossId/users/:userId', bossController.changeUserBoss);

module.exports = router;
