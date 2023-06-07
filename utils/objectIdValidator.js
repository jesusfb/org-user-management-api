const mongoose = require('mongoose');
const { check, param } = require('express-validator');

const { UserRepository } = require('#repositories');
const { User } = require('#models');

const userRepository = new UserRepository(User);

module.exports = ({ fieldName, fieldType, required }) => {
  let validationChain = null;

  if (!fieldName) {
    throw new Error('fieldName is required');
  }

  if (fieldType === 'param') {
    validationChain = param(fieldName);
  } else if (fieldType === 'body') {
    validationChain = check(fieldName);
  } else {
    throw new Error('fieldType must be either param or body');
  }

  if (required) {
    validationChain = validationChain
      .exists()
      .withMessage(`${fieldName} is required`)
      .bail();
  } else {
    validationChain = validationChain.optional();
  }

  return validationChain
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .bail()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${fieldName}`);
      }

      return true;
    })
    .bail()
    .custom(async (value) => {
      const user = await userRepository.findById(value);

      if (!user) {
        throw new Error(`User with provided ${fieldName} does not exist`);
      }

      return true;
    });
};
