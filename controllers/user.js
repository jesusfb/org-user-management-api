const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { UserRepository } = require('#repositories');
const { User } = require('#models');
const config = require('#config');
const { AuthService, UserService } = require('#services');
const { asyncErrorHandler, jwtErrorHandlerWrapper } = require('#utils');

const authService = new AuthService(bcrypt, jwt, config);
const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);

exports.getUsers = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req;
  const user = await userRepository.findById(
    userId,
    config.EXCLUDE_USER_PRIVATE_FIELDS,
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!Object.values(config.ROLES).includes(user.role)) {
    const error = new Error('Invalid user role');
    error.statusCode = 400;
    throw error;
  }

  if (user.role === config.ROLES.REGULAR_USER) {
    return res.status(200).json({ data: [user] });
  }

  if (user.role === config.ROLES.BOSS) {
    const subordinates = await userService.findAllSubordinates(
      userId,
      config.EXCLUDE_USER_PRIVATE_FIELDS,
    );
    return res.status(200).json({ data: [user, ...subordinates] });
  }

  const allUsers = await userRepository.findAll(
    {},
    config.EXCLUDE_USER_PRIVATE_FIELDS,
  );
  return res.status(200).json({ data: allUsers });
});

exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  const { username, password, role, bossId } = req.body;
  const hashedPassword = await authService.hashPassword(password);

  let user = null;
  const session = await User.startSession();
  await session.withTransaction(async () => {
    user = await userRepository.create(
      {
        username,
        password: hashedPassword,
        role,
        bossId,
      },
      { session },
    );

    if (bossId) {
      const bossUser = await userRepository.findById(bossId);
      bossUser.subordinates.push(user.id);

      if (bossUser.role === config.ROLES.REGULAR_USER) {
        bossUser.role = config.ROLES.BOSS;
      }

      await bossUser.save({ session });
    }
  });

  if (!user) {
    const error = new Error('User creation failed');
    error.statusCode = 500;
    throw error;
  }

  return res.status(201).json({
    message: 'User registered successfully',
    data: {
      _id: user.id,
      username: user.username,
      role: user.role,
      bossId: user.bossId,
      subordinates: user.subordinates,
    },
  });
});

exports.authenticateUser = asyncErrorHandler(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await userRepository.findByUsername(username);
  const correctPassword = await authService.checkPassword(
    password,
    user.password,
  );

  if (!user || !correctPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = authService.generateAccessToken(user.id, user.role);
  const refreshToken = authService.generateRefreshToken(user.id, user.role);

  return res.status(200).json({ token, refreshToken });
});

exports.changeBoss = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { bossId } = req.body;

  if (userId === bossId) {
    const error = new Error('User cannot be his own boss');
    error.statusCode = 400;
    throw error;
  }

  if (req.role === config.ROLES.REGULAR_USER) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  if (
    req.role !== config.ROLES.ADMINISTRATOR &&
    !userService.isBossOf(req.userId, userId)
  ) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  if (
    req.role !== config.ROLES.ADMINISTRATOR &&
    !(await userService.isBossOf(req.userId, userId))
  ) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  if (await userService.isBossOf(userId, bossId)) {
    const error = new Error(
      'Cannot assign a subordinate or their subordinates as boss.',
    );
    error.statusCode = 400;
    throw error;
  }

  await userService.changeBoss(bossId, userId);

  return res.status(200).json({ message: 'User boss changed successfully' });
});

exports.refreshToken = jwtErrorHandlerWrapper(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    const error = new Error('Refresh token not provided');
    error.statusCode = 400;
    throw error;
  }

  const { userId, role } = authService.verifyRefreshToken(refreshToken);
  const newToken = authService.generateAccessToken(userId, role);

  return res.status(200).json({ token: newToken });
});
