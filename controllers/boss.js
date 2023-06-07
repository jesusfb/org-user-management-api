const { validationResult } = require('express-validator');

const { User } = require('#models');
const { UserRepository } = require('#repositories');
const { UserService } = require('#services');
const { isSubordinate } = require('#utils');
const { ROLES } = require('#config');

const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);

exports.changeUserBoss = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
  }

  if (req.userId === req.body.bossId) {
    return res.status(400).json({ errors: ['User cannot be his own boss'] });
  }

  if (req.role === ROLES.REGULAR_USER) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId, bossId } = req.body;

  if (req.role === ROLES.BOSS && !isSubordinate(req.userId, bossId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await userService.changeUserBoss(userId, bossId);

    return res.status(200).json({ message: 'User boss changed successfully' });
  } catch (error) {
    return next(error);
  }
};
