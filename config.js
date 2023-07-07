require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SERVER_URL:
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
  ENVS_VARS: ['JWT_SECRET', 'REFRESH_JWT_SECRET', 'DB_CONNECTION_STRING'],
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  TEST_DB_CONNECTION_STRING: process.env.TEST_DB_CONNECTION_STRING,
  ACCESS_TOKEN_EXPIRY: '20m',
  REFRESH_TOKEN_EXPIRY: '1h',
  ROLES: {
    ADMINISTRATOR: 'Administrator',
    REGULAR_USER: 'Regular User',
    BOSS: 'Boss',
  },
  EXCLUDE_USER_PRIVATE_FIELDS: '-password -__v',
};
