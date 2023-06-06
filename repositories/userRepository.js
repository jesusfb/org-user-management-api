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

  async findByUsername(username) {
    return this.model.findOne({ username });
  }

  async findAll(query = {}, projection = '') {
    return this.model.find(query, projection);
  }

  async findAllSubordinates(bossId) {
    return this.model.find({ boss: bossId });
  }
}

module.exports = UserRepository;
