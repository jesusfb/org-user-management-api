const { check } = require('express-validator');

const userAuthentication = [
  check('username')
    .notEmpty()
    .withMessage('Username is required')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Username must be at least 5 characters long'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),
];

module.exports = {
  userAuthentication,
};
