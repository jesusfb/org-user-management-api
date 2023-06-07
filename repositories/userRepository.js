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

  async findAllSubordinates(bossId, projection = '') {
    let subordinates = await this.model.find({ bossId }, projection);

    for (let i = 0; i < subordinates.length; i++) {
      const subordinateSubordinates = await this.findAllSubordinates(
        subordinates[i].id,
        projection,
      );
      subordinates = subordinates.concat(subordinateSubordinates);
    }

    return subordinates;
  }
}

module.exports = UserRepository;
