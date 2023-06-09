# Backend Test Task Repository

This repository contains a Node.js application that implements a simple organizational user structure management system. This application provides an API that supports various operations based on user roles.

## Additional Features

- **Deployment to DigitalOcean**: The application has been successfully deployed on DigitalOcean.
- **Swagger Documentation**: The application includes Swagger Documentation which can be accessed [here](https://monkfish-app-4se3z.ondigitalocean.app/api-docs/).
- **Integration Tests**: The application has a suite of integration tests to ensure functionality and reliability. These tests use the built-in Node.js test runner, which requires Node.js version 20.2 or higher to operate.
- **JWT Refresh Token Functionality**: To enhance security, the application uses JWT for user authentication and includes functionality for token refresh.
- **User Hierarchy Visualization**: An additional /visualize endpoint was added for testing purposes to visualize the user hierarchy in a beautiful JSON format.

## User Roles

1. **Administrator**: The top-most user.
2. **Boss**: Any user with at least one subordinate.
3. **Regular User**: User without any subordinates.

(Note: All users except the Administrator must have a boss (strictly one)).

## REST API Endpoints

### User Registration and Management

- **Register User**: This endpoint (POST /users) is used to register a new user.
- **Change User's Boss**: This endpoint (PATCH /users/{userId}) is used to change a user's boss. Only a boss can do this and only for their subordinates.

### User Authentication and Session Management

- **Authenticate User**: This endpoint (POST /users/authenticate) is used to authenticate a user.
- **Refresh Access Token**: This endpoint (POST /users/refresh) is used to refresh the user's access token when it has expired.

### User Data Access

- **List Users**: This endpoint (GET /users) is used to get a list of users. The list depends on the user's role:
  - The administrator can see all users.
  - A boss can see themselves and all their subordinates (recursively).
  - A regular user can only see themselves.

### System Monitoring or Debugging

- **Visualize User Hierarchy**: This endpoint (GET /visualize) is used to retrieve the user hierarchy for monitoring or debugging purposes.

## Deployment

The application is deployed to DigitalOcean. You can access the Swagger documentation [here](https://monkfish-app-4se3z.ondigitalocean.app/api-docs/).

## Installation and Usage

1. Clone the repository: `git clone https://github.com/nhamonin/org-user-management-api`
2. Navigate to the project directory: `cd org-user-management-api`
3. Install the dependencies: `npm install`
4. Start the server: `npm start`

## Running Tests

1. For running tests: `npm test`
2. For development mode tests: `npm run test:dev`
