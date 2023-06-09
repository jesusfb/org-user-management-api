const { describe, it } = require('node:test');
const assert = require('node:assert');

const setupTestSuite = require('../setup/testSetup');
const {
  registerUser,
  authenticateUser,
  getUsers,
  getToken,
} = require('../helpers/user');
const { User } = require('#models');
const { UserRepository } = require('#repositories');

describe('User Registration', { skip: false }, () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 201 Created', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        'Administrator',
      );

      assert.equal(status, 201);
      assert.equal(data.message, 'User registered successfully');
    });
  });

  describe('Negative cases', () => {
    it('should return 400 Bad Request for wrong value of the role field', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        'Wrong Role',
      );

      assert.equal(status, 400);
      assert.equal(
        data.errors[0],
        'Invalid role. Valid roles are `Administrator` and `Regular User` during registration',
      );
    });

    it('should return 400 for too short username', async () => {
      const { data, status } = await registerUser(
        'ad',
        'admin',
        'Administrator',
      );

      assert.equal(status, 400);
      assert.equal(
        data.errors[0],
        'Username must be at least 5 characters long',
      );
    });

    it('should return 400 Bad Request for missing password field', async () => {
      const { data, status } = await registerUser('admin');

      assert.equal(status, 400);
      assert.ok(
        data.errors.includes('Password is required'),
        'Error message for missing password is not included in the response',
      );
    });

    it('should return 400 Bad Request for nonexistent bossId', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        'Regular User',
        '648188abd50e9168343d094a',
      );

      assert.equal(status, 400);
      assert.equal(data.errors[0], 'User with provided bossId does not exist');
    });

    it('should return 400 Bad Request for wrong role association', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        'Regular User',
      );

      assert.equal(status, 400);
      assert.equal(
        data.errors[0],
        'Boss is required for this role, please provide a valid bossId',
      );
    });

    it('should return 409 Conflict for registering user with existing username', async () => {
      await registerUser('admin', 'admin', 'Administrator');
      const { data, status } = await registerUser(
        'admin',
        'admin',
        'Administrator',
      );

      assert.equal(status, 409);
      assert.equal(data.errors[0], 'Username already exists');
    });

    it('should return 500 Internal Server Error when user creation is broken', async (t) => {
      t.mock.method(UserRepository.prototype, 'create', async () => {
        throw new Error('Internal Server Error');
      });

      const userRepository = new UserRepository(User);
      const { data, status } = await registerUser(
        'admin',
        'admin',
        'Administrator',
      );

      assert.strictEqual(status, 500);
      assert.strictEqual(data.errors[0], 'Internal Server Error');
      assert.strictEqual(userRepository.create.mock.calls.length, 1);
    });
  });
});

describe('User Authentication', { skip: false }, () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 200 OK and token when credentials are valid', async () => {
      await registerUser('admin', 'admin', 'Administrator');
      const { data, status } = await authenticateUser('admin', 'admin');

      assert.equal(status, 200);
      assert.ok(data.token, 'Token is not provided in the response');
      assert.ok(
        data.refreshToken,
        'Refresh token is not provided in the response',
      );
    });
  });

  describe('Negative cases', () => {
    it('should return 401 Unauthorized for invalid credentials', async () => {
      await registerUser('admin', 'admin', 'Administrator');
      const { data, status } = await authenticateUser('admin', 'wrongPassword');

      assert.equal(status, 401);
      assert.ok(
        data.errors.includes(
          'Invalid credentials',
          'Error message for invalid credentials is not included in the response',
        ),
      );
    });

    it('should return 400 Bad Request for missing fields', async () => {
      const { data, status } = await authenticateUser('', '');

      assert.equal(status, 400);
      assert.ok(
        data.errors.includes('Username is required'),
        'Username error not present',
      );
      assert.ok(
        data.errors.includes('Password is required'),
        'Password error not present',
      );
    });

    it('should return 400 Bad Request for short username and password', async () => {
      const { data, status } = await authenticateUser('ad', '123');

      assert.equal(status, 400);
      assert.ok(
        data.errors.includes('Username must be at least 5 characters long'),
        'Username error not present',
      );
      assert.ok(
        data.errors.includes('Password must be at least 5 characters long'),
        'Password error not present',
      );
    });

    it('should return 500 Internal Server Error when authentication is broken', async (t) => {
      t.mock.method(UserRepository.prototype, 'findByUsername', async () => {
        throw new Error('Internal Server Error');
      });

      const userRepository = new UserRepository(User);
      const { status } = await authenticateUser('admin', 'admin');

      assert.strictEqual(status, 500);
      assert.strictEqual(userRepository.findByUsername.mock.calls.length, 1);
    });
  });
});

describe('Get Users', { skip: false }, () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 200 OK and all users for Administrator', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        'Administrator',
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        'Regular User',
        administratorData.data._id,
      );
      await registerUser(
        'reg_user_2',
        'reg_user_1',
        'Regular User',
        bossData.data._id,
      );
      const { token } = await getToken('admin', 'admin');
      const { data, status } = await getUsers(token);
      const users = data.data;

      assert.equal(status, 200);
      assert.ok(users.length === 3, 'Administrator should see all users');
      assert.ok(
        users.find((user) => user._id === administratorData.data._id),
        'Administrator should see herself',
      );
      assert.ok(
        users.find((user) => user._id === bossData.data._id),
        'Administrator should see boss',
      );
      assert.ok(
        users.find((user) => user.username === 'reg_user_2'),
        'Administrator should see regular user',
      );
    });

    it('should return 200 OK and all subordinates for Boss', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        'Administrator',
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        'Regular User',
        administratorData.data._id,
      );
      const { data: userData } = await registerUser(
        'reg_user_1',
        'reg_user_1',
        'Regular User',
        bossData.data._id,
      );
      const { token } = await getToken('boss1', 'boss1');
      const { data, status } = await getUsers(token);
      const users = data.data;

      assert.equal(status, 200);
      assert.ok(
        users.length === 2,
        'Boss should see herself and all subordinates',
      );
      assert.ok(
        users.find((user) => user._id === bossData.data._id),
        'Boss should see herself',
      );
      assert.ok(
        users.find((user) => user._id === userData.data._id),
        'Boss should see all subordinates',
      );
    });

    it('should return 200 OK and only himself for Regular User', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        'Administrator',
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        'Regular User',
        administratorData.data._id,
      );
      const { data: userData } = await registerUser(
        'reg_user_1',
        'reg_user_1',
        'Regular User',
        bossData.data._id,
      );
      const { token } = await getToken('reg_user_1', 'reg_user_1');
      const { data, status } = await getUsers(token);
      const users = data.data;

      assert.equal(status, 200);
      assert.ok(users.length === 1, 'Regular User should see only himself');
      assert.ok(
        users.find((user) => user._id === userData.data._id),
        'Regular User should see only himself',
      );
    });
  });

  describe('Negative cases', () => {
    it('should return 401 Unauthorized for missing token', async () => {
      const { data, status } = await getUsers();

      assert.equal(status, 401);
      assert.ok(
        data.errors.includes('Invalid token'),
        'Unauthorized error not present',
      );
    });

    it('should return 401 Unauthorized for invalid token', async () => {
      const { data, status } = await getUsers('malformed_token');

      assert.equal(status, 401);
      assert.ok(
        data.errors.includes('Malformed token'),
        'Unauthorized error not present',
      );
    });

    it('should return 500 Internal Server Error when something goes wrong on server', async (t) => {
      t.mock.method(UserRepository.prototype, 'findById', async () => {
        throw new Error('Internal Server Error');
      });
      const userRepository = new UserRepository(User);

      await registerUser('admin', 'admin', 'Administrator');
      const { token } = await getToken('admin', 'admin');
      const { data, status } = await getUsers(token);

      assert.strictEqual(status, 500);
      assert.strictEqual(data.errors[0], 'Internal Server Error');
      assert.strictEqual(userRepository.findById.mock.calls.length, 1);
    });
  });
});
