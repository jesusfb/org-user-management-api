const { validationResult } = require('express-validator');

const validate = (checks) => async (req, res, next) => {
  await Promise.all(checks.map((check) => check.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.status(400).json({ errors: errors.array().map((e) => e.msg) });
};

module.exports = validate;
