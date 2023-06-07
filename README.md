# Backend Test Task Repository

This repository contains a Node.js application that implements a simple organizational user structure management system. This application provides an API that supports various operations based on user roles.

## User Roles

1. **Administrator**: The top-most user.
2. **Boss**: Any user with at least one subordinate.
3. **Regular User**: User without any subordinates.

(Note: All users except the Administrator must have a boss (strictly one)).

## REST API Endpoints

1. **Register User**: This endpoint is used to register a new user.
2. **Authenticate User**: This endpoint is used to authenticate a user.
3. **List Users**: This endpoint is used to get a list of users. The list depends on the user's role:
   - The administrator can see all users.
   - A boss can see themselves and all their subordinates (recursively).
   - A regular user can only see themselves.
4. **Change User's Boss**: This endpoint is used to change a user's boss. Only a boss can do this and only for their subordinates.

## Deployment

The application is deployed to DigitalOcean. You can access the Swagger documentation [here](https://monkfish-app-4se3z.ondigitalocean.app/api-docs/).

## Installation and Usage

1. Clone the repository: `git clone https://github.com/nhamonin/org-user-management-api`
2. Navigate to the project directory: `cd org-user-management-api`
3. Install the dependencies: `npm install`
4. Start the server: `npm start`
