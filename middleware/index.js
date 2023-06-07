const authenticate = require('./authenticate');
const errorHandler = require('./errorHandler');

const { userRegistration } = require('./validators/userRegistration');
const { userAuthentication } = require('./validators/userAuthentication');
const { userBossChange } = require('./validators/userBossChange');

module.exports = {
  authenticate,
  errorHandler,
  userRegistration,
  userAuthentication,
  userBossChange,
};
