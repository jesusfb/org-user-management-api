const { mock, before, beforeEach, afterEach, after } = require('node:test');
const http = require('node:http');

const mongoose = require('mongoose');

const app = require('#app');
const connectDB = require('#database');
const { User } = require('#models');
const { UserRepository } = require('#repositories');
const { PORT } = require('#config');

const userRepository = new UserRepository(User);

let server;

async function setup() {
  server = http.createServer(app);
  server.listen(PORT);
  await connectDB({ logging: false });
}

async function teardown() {
  await mongoose.connection.close();
  await server.close();
}

async function cleanup() {
  mock.restoreAll();
  await userRepository.deleteMany();
}

module.exports = function setupTestSuite() {
  before(async () => {
    await setup();
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterEach(async () => {
    await cleanup();
  });

  after(async () => {
    await teardown();
  });
};
