const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserRepository = require('../repositories/userRepository');
const User = require('../models/user');
const config = require('../config');
const AuthService = require('../services/authService');

const authService = new AuthService(bcrypt, jwt, config);
const userRepository = new UserRepository(User);

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userRepository.findAll();
    return res.send(users);
  } catch (error) {
    return next(error);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, role, boss } = req.body;
    const hashedPassword = authService.hashPassword(password);
    const user = await userRepository.create({
      username,
      password: hashedPassword,
      role,
      boss,
    });

    return res.status(201).json({
      data: {
        username: user.username,
        role: user.role,
        boss: user.boss,
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

    const token = authService.generateToken(user.id);

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
};
