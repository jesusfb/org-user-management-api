require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  SESSION_EXPIRY: 1000 * 60 * 20,
};
