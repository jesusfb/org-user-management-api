const express = require('express');

const userRouter = require('./routes/user');
const bossRouter = require('./routes/boss');

const app = express();

app.use(express.json());

app.use('/users', userRouter);
app.use('/boss', bossRouter);

app.listen(3000, () => {});
