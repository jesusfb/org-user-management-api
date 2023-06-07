const { UserRepository } = require('#repositories');

const { User } = require('#models');

const userRepository = new UserRepository(User);

const isSubordinate = async (userId, subordinateId) => {
  const subordinate = await userRepository.findById(subordinateId);
  if (!subordinate) {
    throw new Error('Subordinate user does not exist');
  }

  let currentBoss = await userRepository.findById(subordinate.bossId);
  while (currentBoss) {
    if (currentBoss._id.toString() === userId) {
      return true;
    }
    currentBoss = await userRepository.findById(currentBoss.bossId);
  }

  return false;
};

module.exports = isSubordinate;
