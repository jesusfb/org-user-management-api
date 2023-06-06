const mongoose = require('mongoose');
const { check } = require('express-validator');

const UserRepository = require('../../repositories/userRepository');
const User = require('../../models/user');
const { ROLES } = require('../../config');

const userRepository = new UserRepository(User);

const validateRegistration = [
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
        'Invalid role. Valid roles are Administrator and Regular User during registration',
      );
    }

    if (role === ROLES.ADMINISTRATOR && req.body.boss) {
      throw new Error('Administrator cannot have a boss');
    }

    if (role !== ROLES.ADMINISTRATOR && !req.body.boss) {
      throw new Error('Boss is required for this role');
    }

    return true;
  }),
  check('boss')
    .isString()
    .optional()
    .withMessage('Boss must be a string')
    .bail()
    .custom((boss) => {
      if (!mongoose.Types.ObjectId.isValid(boss)) {
        throw new Error('Invalid boss id');
      }

      return true;
    })
    .bail()
    .custom(async (boss) => {
      const user = await userRepository.findById(boss);

      if (!user) {
        throw new Error('Boss with provided id does not exist');
      }

      return true;
    }),
];

module.exports = {
  validateRegistration,
};
