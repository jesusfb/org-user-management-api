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

  async findByUsername(username, projection = '') {
    return this.model.findOne({ username }, projection);
  }

  async findAll(query = {}, projection = '') {
    return this.model.find(query, projection);
  }

  async update(id, data) {
    return this.model.updateOne({ _id: id }, data);
  }

  async deleteMany(filter = {}) {
    return this.model.deleteMany(filter);
  }
}

module.exports = UserRepository;
