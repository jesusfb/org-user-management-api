const mongoose = require('mongoose');

const config = require('#config');

const connectDB = async (options) => {
  const connectionString = process.env.NODE_ENV === 'test'
    ? config.TEST_DB_CONNECTION_STRING
    : config.DB_CONNECTION_STRING;

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (options?.logging) console.log('MongoDB connection SUCCESS');
  } catch (error) {
    if (options?.logging) console.error('MongoDB connection FAIL', error);
    process.exit(1);
  }
};

module.exports = connectDB;
