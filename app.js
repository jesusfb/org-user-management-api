const express = require('express');
const dotenv = require('dotenv');

const connectDB = require('./database/database');

const userRouter = require('./routes/user');
const bossRouter = require('./routes/boss');

dotenv.config();

const app = express();
connectDB();

app.use(express.json());

app.use('/users', userRouter);
app.use('/boss', bossRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started and listening on port ${PORT}`);
});
