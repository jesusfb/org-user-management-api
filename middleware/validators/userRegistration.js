const { check } = require('express-validator');

const { UserRepository } = require('#repositories');
const { User } = require('#models');
const { ROLES } = require('#config');
const { objectIdValidator } = require('#utils');

const userRepository = new UserRepository(User);

const userRegistration = [
  check('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 5 })
    .withMessage('Username must be at least 5 characters long')
    .custom(async (username) => {
      const user = await userRepository.findByUsername(username);

      if (user) {
        throw new Error('Username already in use');
      }

      return true;
    }),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),
  check('role').custom((role, { req }) => {
    if (role && ![ROLES.ADMINISTRATOR, ROLES.REGULAR_USER].includes(role)) {
      throw new Error(
        'Invalid role. Valid roles are `Administrator` and `Regular User` during registration',
      );
    }

    if (role === ROLES.ADMINISTRATOR && req.body.bossId) {
      throw new Error('Administrator cannot have a boss, please remove bossId');
    }

    if (role !== ROLES.ADMINISTRATOR && !req.body.bossId) {
      throw new Error(
        'Boss is required for this role, please provide a valid bossId',
      );
    }

    return true;
  }),
  objectIdValidator({ fieldName: 'bossId', required: false }),
];

module.exports = {
  userRegistration,
};
