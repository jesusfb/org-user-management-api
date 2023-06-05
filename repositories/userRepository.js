class UserRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findAll() {
    return this.model.find({});
  }

  async findAllSubordinates(bossId) {
    return this.model.find({ boss: bossId });
  }
}

module.exports = UserRepository;
