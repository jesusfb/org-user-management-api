require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  ACCESS_TOKEN_EXPIRY: 1000 * 60 * 20, // 20 minutes
  REFRESH_TOKEN_EXPIRY: 1000 * 60 * 60, // 1 hour
  ROLES: {
    ADMINISTRATOR: 'Administrator',
    REGULAR_USER: 'Regular User',
    BOSS: 'Boss',
  },
  EXCLUDE_USER_PRIVATE_FIELDS: '-password -__v',
};
