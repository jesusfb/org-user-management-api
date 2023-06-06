const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const UserRepository = require('../repositories/userRepository');
const User = require('../models/user');
const config = require('../config');
const AuthService = require('../services/authService');

const authService = new AuthService(bcrypt, jwt, config);
const userRepository = new UserRepository(User);

exports.getUsers = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ errors: ['User not found'] });
    }

    if (user.role === config.ROLES.REGULAR_USER) {
      return res.status(200).json({ data: [user] });
    }

    if (user.role === config.ROLES.BOSS) {
      const users = await userRepository.findAllSubordinates(userId);
      return res.status(200).json({ data: users });
    }

    if (user.role === config.ROLES.ADMINISTRATOR) {
      const users = await userRepository.findAll();
      return res.status(200).json({ data: users });
    }

    return res.status(500).json({ errors: ['Internal server error'] });
  } catch (error) {
    return next(error);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    const { username, password, role, boss } = req.body;
    const hashedPassword = authService.hashPassword(password);

    let user = null;
    const session = await User.startSession();
    await session.withTransaction(async () => {
      user = await userRepository.create(
        {
          username,
          password: hashedPassword,
          role,
          boss,
        },
        { session },
      );

      if (boss) {
        const bossUser = await userRepository.findById(boss);
        bossUser.subordinates.push(user.id);

        if (bossUser.role === 'Regular User') {
          bossUser.role = 'Boss';
        }

        await bossUser.save({ session });
      }
    });

    if (!user) {
      throw new Error('User creation failed');
    }

    return res.status(201).json({
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        boss: user.boss,
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = authService.generateAccessToken(user.id);
    const refreshToken = authService.generateRefreshToken(user.id);

    return res.status(200).json({ token, refreshToken });
  } catch (error) {
    return next(error);
  }
};
