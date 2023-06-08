const http = require('node:http');

const mongoose = require('mongoose');

const app = require('#app');
const connectDB = require('#database');
const { User } = require('#models');
const { UserRepository } = require('#repositories');

const userRepository = new UserRepository(User);

let server;

async function setup() {
  server = http.createServer(app);
  await connectDB({ logging: true });
}

async function teardown() {
  await mongoose.connection.close();
  await server.close();
}

async function cleanup() {
  await userRepository.deleteMany();
}

module.exports = {
  setup,
  teardown,
  cleanup,
};
