const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserRepository = require('../repositories/userRepository');
const User = require('../models/user');

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
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await userRepository.create({
      username,
      password: hashedPassword,
      role,
      boss,
    });
    await user.save();

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

exports.authenticateUser = async (req, res, next) => {
  try {
    const VALIDATION_PERIOD_MS = 1000 * 60 * 20;
    const { username, password } = req.body;
    const user = await userRepository.findByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: VALIDATION_PERIOD_MS,
    });

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};
