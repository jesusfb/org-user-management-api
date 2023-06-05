const mongoose = require('mongoose');

const config = require('../config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connection SUCCESS');
  } catch (error) {
    console.error('MongoDB connection FAIL', error);
    process.exit(1);
  }
};

module.exports = connectDB;
