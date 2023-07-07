require('events').EventEmitter.defaultMaxListeners = 20;
const { describe, it } = require('node:test');
const assert = require('node:assert');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { User } = require('#models');
const { UserRepository } = require('#repositories');
const config = require('#config');
const { AuthService } = require('#services');

const setupTestSuite = require('../setup/testSetup');
const {
  registerUser,
  authenticateUser,
  getUsers,
  getToken,
  changeUserBoss,
  refreshAccessToken,
} = require('../helpers/user');

describe('User Registration', () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 201 Created', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
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
        config.ROLES.ADMINISTRATOR,
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

    it('should return 400 Bad Request for wrong role association', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        config.ROLES.REGULAR_USER,
      );

      assert.equal(status, 400);
      assert.equal(
        data.errors[0],
        'Boss is required for this role, please provide a valid bossId',
      );
    });

    it('should return 404 Not Found for nonexistent bossId', async () => {
      const { data, status } = await registerUser(
        'admin',
        'admin',
        config.ROLES.REGULAR_USER,
        '648188abd50e9168343d094a',
      );

      assert.equal(status, 404);
      assert.equal(data.errors[0], 'User with provided bossId does not exist');
    });

    it('should return 409 Conflict for registering user with existing username', async () => {
      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
      const { data, status } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
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
        config.ROLES.ADMINISTRATOR,
      );

      assert.strictEqual(status, 500);
      assert.strictEqual(data.errors[0], 'Internal Server Error');
      assert.strictEqual(userRepository.create.mock.calls.length, 1);
    });
  });
});

describe('User Authentication', () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 200 OK and token when credentials are valid', async () => {
      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
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
      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
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

describe('Get Users', () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 200 OK and all users for Administrator', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      await registerUser(
        'reg_user_2',
        'reg_user_1',
        config.ROLES.REGULAR_USER,
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
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: userData } = await registerUser(
        'reg_user_1',
        'reg_user_1',
        config.ROLES.REGULAR_USER,
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
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: userData } = await registerUser(
        'reg_user_1',
        'reg_user_1',
        config.ROLES.REGULAR_USER,
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

      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
      const { token } = await getToken('admin', 'admin');
      const { data, status } = await getUsers(token);

      assert.strictEqual(status, 500);
      assert.strictEqual(data.errors[0], 'Internal Server Error');
      assert.strictEqual(userRepository.findById.mock.calls.length, 1);
    });
  });
});

describe('Change user boss', () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it("should return 200 OK when Boss changes subordinate's boss", async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('boss1', 'boss1');
      const { status } = await changeUserBoss(
        token,
        subordinateData.data._id,
        newBossData.data._id,
      );

      assert.equal(status, 200);
    });
  });

  describe('Negative cases', () => {
    it('should return 400 Bad request if a boss attempts to change their own boss', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { token } = await getToken('admin', 'admin');
      const { status } = await changeUserBoss(
        token,
        administratorData.data._id,
        administratorData.data._id,
      );

      assert.equal(status, 400);
    });

    it('should return 400 Bad request if user try to set himself as boss', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('boss1', 'boss1');
      const { status } = await changeUserBoss(
        token,
        bossData.data._id,
        bossData.data._id,
      );

      assert.equal(status, 400);
    });

    it('should return 401 Unauthorized for missing token', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { status } = await changeUserBoss(
        null,
        subordinateData.data._id,
        newBossData.data._id,
      );

      assert.equal(status, 401);
    });

    it('should return 401 Unauthorized for invalid token', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { status } = await changeUserBoss(
        'invalid_token',
        subordinateData.data._id,
        newBossData.data._id,
      );

      assert.equal(status, 401);
    });

    it('should return 403 Forbidden for Regular User', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('subordinate', 'subordinate');
      const { status } = await changeUserBoss(
        token,
        subordinateData.data._id,
        newBossData.data._id,
      );

      assert.equal(status, 403);
    });

    it('should return 403 Forbidden for Boss who is not subordinate boss', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('newboss', 'newboss');
      const { status } = await changeUserBoss(
        token,
        subordinateData.data._id,
        newBossData.data._id,
      );

      assert.equal(status, 403);
    });

    it('should return 404 Not Found for invalid subordinate id', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('subordinate', 'subordinate');
      const nonExistentUserId = '6089f6e27d38faaedcbd0219';
      const { status } = await changeUserBoss(
        token,
        nonExistentUserId,
        newBossData.data._id,
      );

      assert.equal(status, 404);
    });

    it('should return 404 Not Found for invalid new boss id', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { token } = await getToken('boss1', 'boss1');
      const nonExistentUserId = '6089f6e27d38faaedcbd0219';
      const { status } = await changeUserBoss(
        token,
        subordinateData.data._id,
        nonExistentUserId,
      );

      assert.equal(status, 404);
    });

    it('should return 404 Not Found if the user does not exist', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('admin', 'admin');
      const nonExistentUserId = '6089f6e27d38faaedcbd0219';
      const { status } = await changeUserBoss(
        token,
        nonExistentUserId,
        bossData.data._id,
      );

      assert.equal(status, 404);
    });

    it('should return 404 Not Found if the new boss does not exist', async () => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('admin', 'admin');
      const nonExistentBossId = '6089f6e27d38faaedcbd0219';
      const { status } = await changeUserBoss(
        token,
        subordinateData.data._id,
        nonExistentBossId,
      );

      assert.equal(status, 404);
    });

    it('should return 500 Internal Server Error when something goes wrong on the server', async (t) => {
      const { data: administratorData } = await registerUser(
        'admin',
        'admin',
        config.ROLES.ADMINISTRATOR,
      );
      const { data: bossData } = await registerUser(
        'boss1',
        'boss1',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { data: subordinateData } = await registerUser(
        'subordinate',
        'subordinate',
        config.ROLES.REGULAR_USER,
        bossData.data._id,
      );
      const { data: newBossData } = await registerUser(
        'newboss',
        'newboss',
        config.ROLES.REGULAR_USER,
        administratorData.data._id,
      );
      const { token } = await getToken('boss1', 'boss1');

      t.mock.method(UserRepository.prototype, 'update', async () => {
        throw new Error('Internal Server Error');
      });
      const userRepository = new UserRepository(User);
      const { data, status } = await changeUserBoss(
        token,
        subordinateData.data._id,
        newBossData.data._id,
      );

      assert.strictEqual(status, 500);
      assert.strictEqual(data.errors[0], 'Internal Server Error');
      assert.strictEqual(userRepository.update.mock.calls.length, 1);
    });
  });
});

describe('Refresh Token', () => {
  setupTestSuite();

  describe('Positive cases', () => {
    it('should return 200 OK and a new access token when refreshing a valid refresh token', async () => {
      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
      const { data: authData } = await authenticateUser('admin', 'admin');
      const { status, data } = await refreshAccessToken(authData?.refreshToken);

      assert.equal(status, 200);
      assert.ok(data.token);
    });
  });

  describe('Negative cases', () => {
    it('should return 400 Bad Request when no refresh token is provided', async () => {
      const { status, data } = await refreshAccessToken(null);

      assert.equal(status, 400);
      assert.ok(data.errors.includes('Refresh token not provided'));
    });

    it('should return 401 Unauthorized when an invalid refresh token is provided', async () => {
      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
      await authenticateUser('admin', 'admin');
      const { status, data } = await refreshAccessToken(
        'invalid_refresh_token',
      );

      assert.equal(status, 401);
      assert.ok(data.errors.includes('Malformed token'));
    });

    it('should return 500 Internal Server Error when an unexpected error occurs during token refresh', async (t) => {
      const authService = new AuthService(bcrypt, jwt, config);
      t.mock.method(AuthService.prototype, 'verifyRefreshToken', () => {
        const error = new Error('Internal Server Error');
        error.statusCode = 500;
        throw error;
      });

      await registerUser('admin', 'admin', config.ROLES.ADMINISTRATOR);
      const { data: authData } = await authenticateUser('admin', 'admin');
      const { status, data } = await refreshAccessToken(authData?.refreshToken);

      assert.equal(status, 500);
      assert.ok(data.errors.includes('Internal Server Error'));
      assert.strictEqual(authService.verifyRefreshToken.mock.calls.length, 1);
    });
  });
});
