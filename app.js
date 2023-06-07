const express = require('express');
const swaggerUi = require('swagger-ui-express');

const { userRouter, bossRouter, visualizeRouter } = require('#routes');
const config = require('#config');
const connectDB = require('#database');
const specs = require('./swaggerDefinition');
const { errorHandler } = require('#middleware');

const app = express();

connectDB();

app.use(express.json());

app.use('/users', userRouter);
app.use('/boss', bossRouter);
app.use('/visualize', visualizeRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server started and listening on port ${config.PORT}`);
});
