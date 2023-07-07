const { validationResult } = require('express-validator');
const { asyncErrorHandler } = require('#utils');

const validate = (checks) =>
  asyncErrorHandler(async (req, res, next) => {
    await Promise.all(checks.map((check) => check.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorArray = errors.array().map((e) => e.msg);

    const error = new Error();
    error.messages = errorArray;
    error.statusCode = req.customStatusCode || 400;

    throw error;
  });

module.exports = validate;
