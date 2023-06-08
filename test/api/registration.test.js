const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert');

const { setup, teardown, cleanup } = require('../setup/testSetup');
const config = require('#config');
const { User } = require('#models');
const { UserRepository } = require('#repositories');

describe('User Registration', () => {
  before(async () => {
    await setup();
  });

  afterEach(async () => {
    await cleanup();
  });

  after(async () => {
    await teardown();
  });

  describe('Positive cases', () => {
    it('should return 201 Created', async () => {
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Administrator',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 201);
      assert.equal(data.message, 'User registered successfully');
    });
  });

  describe('Negative cases', () => {
    it('should return 400 Bad Request for wrong value of the role field', async () => {
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Wrong Role',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 400);
      assert.equal(
        data.errors[0],
        'Invalid role. Valid roles are `Administrator` and `Regular User` during registration',
      );
    });

    it('should return 400 for too short username', async () => {
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'ad',
          password: 'admin',
          role: 'Administrator',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 400);
      assert.equal(
        data.errors[0],
        'Username must be at least 5 characters long',
      );
    });

    it('should return 400 Bad Request for missing password field', async () => {
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 400);
      assert.ok(
        data.errors.includes('Password is required'),
        'Error message for missing password is not included in the response',
      );
    });

    it('should return 400 Bad Request for nonexistent bossId', async () => {
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Regular User',
          bossId: '648188abd50e9168343d094a',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 400);
      assert.equal(data.errors[0], 'User with provided bossId does not exist');
    });

    it('should return 400 Bad Request for wrong role association', async () => {
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Regular User',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 400);
      assert.equal(
        data.errors[0],
        'Boss is required for this role, please provide a valid bossId',
      );
    });

    it('should return 409 Conflict for registering user with existing username', async () => {
      await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Administrator',
        }),
      });

      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Administrator',
        }),
      });

      const data = await response.json();

      assert.equal(response.status, 409);
      assert.equal(data.errors[0], 'Username already exists');
    });

    it('should return 500 Internal Server Error when database is down', async (t) => {
      const MockUserRepository = t.mock.fn(UserRepository);
      MockUserRepository.prototype.create = t.mock.fn(() => {
        throw new Error('Internal Server Error');
      });

      const userRepository = new MockUserRepository(User);
      const response = await fetch(`${config.SERVER_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin',
          role: 'Administrator',
        }),
      });

      const data = await response.json();

      assert.strictEqual(response.status, 500);
      assert.strictEqual(data.errors[0], 'Internal Server Error');
      assert.strictEqual(userRepository.create.mock.calls.length, 1);
    });
  });
});
