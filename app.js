const express = require('express');
const swaggerUi = require('swagger-ui-express');

const userRouter = require('./routes/user');
const bossRouter = require('./routes/boss');

const config = require('./config');
const connectDB = require('./database/database');
const swaggerDocument = require('./swaggerDefinition');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(express.json());

app.use('/users', userRouter);
app.use('/boss', bossRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server started and listening on port ${config.PORT}`);
});
