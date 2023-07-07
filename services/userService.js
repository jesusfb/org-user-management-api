const config = require('#config');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async isBossOf(bossId, subordinateId) {
    if (bossId === subordinateId) {
      return true;
    }

    const subordinate = await this.userRepository.findById(subordinateId);
    if (!subordinate) {
      throw new Error('Subordinate user does not exist');
    }

    let currentBoss = await this.userRepository.findById(subordinate.bossId);
    while (currentBoss) {
      if (currentBoss._id.toString() === bossId) {
        return true;
      }
      currentBoss = await this.userRepository.findById(currentBoss.bossId);
    }

    return false;
  }

  async findAllSubordinates(bossId, projection = '') {
    let subordinates = await this.userRepository.findAll(
      { bossId },
      projection,
    );

    for (let i = 0; i < subordinates.length; i++) {
      const subordinateSubordinates = await this.findAllSubordinates(
        subordinates[i].id,
        projection,
      );
      subordinates = subordinates.concat(subordinateSubordinates);
    }

    return subordinates;
  }

  async changeBoss(bossId, userId) {
    const user = await this.userRepository.findById(userId);
    const oldBossId = user.bossId;
    const newBoss = await this.userRepository.findById(bossId);

    await this.userRepository.update({ _id: userId }, { bossId });

    if (newBoss.role === config.ROLES.REGULAR_USER) {
      await this.userRepository.update(
        { _id: bossId },
        { $push: { subordinates: userId }, $set: { role: config.ROLES.BOSS } },
      );
    } else {
      await this.userRepository.update(
        { _id: bossId },
        { $push: { subordinates: userId } },
      );
    }

    await this.userRepository.update(
      { _id: oldBossId },
      { $pull: { subordinates: userId } },
    );

    const oldBoss = await this.userRepository.findById(oldBossId);
    if (
      oldBoss.subordinates.length === 0
      && oldBoss.role === config.ROLES.BOSS
    ) {
      await this.userRepository.update(
        { _id: oldBossId },
        { $set: { role: config.ROLES.REGULAR_USER } },
      );
    }
  }
}

module.exports = UserService;
