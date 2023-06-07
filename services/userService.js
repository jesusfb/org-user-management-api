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

  async changeBoss(userId, bossId) {
    const user = await this.model.findById(userId);
    const oldBossId = user.bossId;
    const newBoss = await this.model.findById(bossId);

    await this.model.updateOne({ _id: userId }, { bossId });

    if (newBoss.role === 'Regular User') {
      await this.model.updateOne(
        { _id: bossId },
        { $push: { subordinates: userId }, $set: { role: 'Boss' } },
      );
    } else {
      await this.model.updateOne(
        { _id: bossId },
        { $push: { subordinates: userId } },
      );
    }

    await this.model.updateOne(
      { _id: oldBossId },
      { $pull: { subordinates: userId } },
    );

    const oldBoss = await this.model.findById(oldBossId);
    if (oldBoss.subordinates.length === 0) {
      await this.model.updateOne(
        { _id: oldBossId },
        { $set: { role: 'Regular User' } },
      );
    }
  }
}

module.exports = UserService;
