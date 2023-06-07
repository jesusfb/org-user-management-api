class UserRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, projection = '') {
    return this.model.findById(id, projection);
  }

  async findAll(query = {}, projection = '') {
    return this.model.find(query, projection);
  }

  // TODO: Implement this method
  async findAllSubordinates(bossId, projection = '') {
    return this.model.find({ boss: bossId }, projection);
  }
}

module.exports = UserRepository;
