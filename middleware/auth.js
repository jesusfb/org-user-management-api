const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('../config');
const AuthService = require('../services/authService');

const authService = new AuthService(bcrypt, jwt, config);

function returnInvalidToken(res) {
  return res.status(401).json({ message: 'Invalid token' });
}

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return returnInvalidToken(res);
  }

  const token = authorization.replace('Bearer ', '').trim();

  if (!token) {
    return returnInvalidToken(res);
  }

  try {
    const decoded = authService.verifyToken(token);

    req.userId = decoded.id;

    return next();
  } catch (error) {
    return returnInvalidToken(res);
  }
};
