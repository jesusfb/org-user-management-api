function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function jwtErrorHandlerWrapper(fn) {
  // eslint-disable-next-line global-require
  const { jwtErrorHandler } = require('#utils');

  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error.statusCode ? error : jwtErrorHandler(error, next));
    }
  };
}

module.exports = {
  asyncErrorHandler,
  jwtErrorHandlerWrapper,
};
