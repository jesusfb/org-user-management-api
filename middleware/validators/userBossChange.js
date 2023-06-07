const { UserRepository } = require('#repositories');
const { User } = require('#models');
const { ROLES } = require('#config');
const { objectIdValidator } = require('#utils');

const userRepository = new UserRepository(User);

const userBossChange = [
  objectIdValidator({
    fieldName: 'userId',
    fieldType: 'param',
    required: true,
  }).custom(async (userId) => {
    const user = await userRepository.findById(userId);

    if (user.role === ROLES.ADMINISTRATOR) {
      throw new Error('Administrator cannot have a boss');
    }

    return true;
  }),
  objectIdValidator({ fieldName: 'bossId', fieldType: 'body', required: true }),
];

module.exports = {
  userBossChange,
};
