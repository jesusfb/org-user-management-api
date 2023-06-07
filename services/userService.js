class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
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

    if (newBoss.role === 'Regular User') {
      await this.userRepository.update(
        { _id: bossId },
        { $push: { subordinates: userId }, $set: { role: 'Boss' } },
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
    if (oldBoss.subordinates.length === 0 && oldBoss.role === 'Boss') {
      await this.userRepository.update(
        { _id: oldBossId },
        { $set: { role: 'Regular User' } },
      );
    }
  }
}

module.exports = UserService;
