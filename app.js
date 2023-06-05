const express = require('express');

const userRouter = require('./routes/user');
const bossRouter = require('./routes/boss');

const config = require('./config');
const connectDB = require('./database/database');

const app = express();

connectDB();

app.use(express.json());

app.use('/users', userRouter);
app.use('/boss', bossRouter);

app.listen(config.PORT, () => {
  console.log(`Server started and listening on port ${config.PORT}`);
});
