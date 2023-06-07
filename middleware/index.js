const authenticate = require('./authenticate');
const errorHandler = require('./errorHandler');

const { validateUserRegistration } = require('./validators/userValidator');

module.exports = {
  authenticate,
  errorHandler,
  validateUserRegistration,
};
