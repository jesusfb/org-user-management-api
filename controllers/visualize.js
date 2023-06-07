const { User } = require('#models');
const { UserRepository } = require('#repositories');
const { EXCLUDE_USER_PRIVATE_FIELDS } = require('#config');

const userRepository = new UserRepository(User);

async function printHierarchy(userId) {
  const user = await userRepository.findById(
    userId,
    EXCLUDE_USER_PRIVATE_FIELDS,
  );

  if (!user) {
    return null;
  }

  const subordinates = await Promise.all(user.subordinates.map(printHierarchy));

  return {
    ...user.toObject(),
    subordinates,
  };
}

exports.printHierarchy = async (req, res, next) => {
  const allUsers = await userRepository.findAll();
  const findBoss = (user, users) =>
    users.find((u) => u.subordinates.includes(user.id));

  const topUsers = allUsers.filter((user) => !findBoss(user, allUsers));

  if (topUsers.length === 0) {
    res.json({ message: 'No top users found.' });
    return;
  }

  const hierarchy = await Promise.all(topUsers.map(printHierarchy));

  res.json(hierarchy);
};
