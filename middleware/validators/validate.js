const { validationResult } = require('express-validator');

const validate = (checks) => async (req, res, next) => {
  try {
    await Promise.all(checks.map((check) => check.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const error = new Error(
      errors
        .array()
        .map((e) => e.msg)
        .join('\n'),
    );
    error.statusCode = 400;
    throw error;
  } catch (error) {
    return next(error);
  }
};

module.exports = validate;
