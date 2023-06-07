const { Router } = require('express');

const { bossController } = require('#controllers');
const { bossChange, authenticate } = require('#middleware');

const router = Router();

router.get(
  '/:bossId/users/:userId',
  bossChange,
  authenticate,
  bossController.changeUserBoss,
);

module.exports = router;
