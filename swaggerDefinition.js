const swaggerJsdoc = require('swagger-jsdoc');

const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Organization Structure Management API',
      version: '1.0.0',
      description: `This API enables the management of a simple organization user structure with three roles: Administrator, Boss, and Regular user.
      It provides operations to register a new user, authenticate as a user, list users with visibility constraints based on roles,
      and change a user's boss (only a boss can do this for her subordinates). The Administrator can see all users, a Boss can see herself and all her subordinates,
      and a Regular user can only see herself.`,
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
