const mongoose = require('mongoose');
const { check } = require('express-validator');

const { UserRepository } = require('#repositories');
const { User } = require('#models');

const userRepository = new UserRepository(User);

module.exports = ({ fieldName, required }) => {
  let validationChain = check(fieldName);

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
