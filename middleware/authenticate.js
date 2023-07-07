const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('#config');
const { AuthService } = require('#services');
const { jwtErrorHandlerWrapper } = require('#utils');

const authService = new AuthService(bcrypt, jwt, config);

function returnInvalidToken() {
  const error = new Error('Invalid token');
  error.statusCode = 401;
  throw error;
}

module.exports = jwtErrorHandlerWrapper(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return returnInvalidToken();
  }

  const token = authorization.replace('Bearer ', '').trim();

  if (!token) {
    return returnInvalidToken();
  }

  const { userId, role } = authService.verifyToken(token);

  if (!userId || !role) {
    return returnInvalidToken();
  }

  req.userId = userId;
  req.role = role;

  return next();
});
