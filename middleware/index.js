const authenticate = require('./authenticate');
const errorHandler = require('./errorHandler');

const { userRegistration } = require('./validators/userRegistration');
const { userAuthentication } = require('./validators/userAuthentication');
const { bossChange } = require('./validators/bossChange');

module.exports = {
  authenticate,
  errorHandler,
  userRegistration,
  userAuthentication,
  bossChange,
};
