const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { UserRepository } = require('#repositories');
const { User } = require('#models');
const config = require('#config');
const { AuthService, UserService } = require('#services');

const authService = new AuthService(bcrypt, jwt, config);
const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);

exports.getUsers = async (req, res, next) => {
  try {
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
  } catch (error) {
    return next(error);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, role, bossId } = req.body;
    const hashedPassword = authService.hashPassword(password);

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

        if (bossUser.role === 'Regular User') {
          bossUser.role = 'Boss';
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
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        bossId: user.bossId,
        subordinates: user.subordinates,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.authenticateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userRepository.findByUsername(username);

    if (!user || !authService.checkPassword(password, user.password)) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = authService.generateAccessToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id, user.role);

    return res.status(200).json({ token, refreshToken });
  } catch (error) {
    return next(error);
  }
};

exports.changeBoss = async (req, res, next) => {
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

  if (!userService.isSubordinate(bossId, userId)) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  try {
    await userService.changeBoss(bossId, userId);

    return res.status(200).json({ message: 'User boss changed successfully' });
  } catch (error) {
    return next(error);
  }
};
