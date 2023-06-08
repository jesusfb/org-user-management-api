module.exports = function jwtErrorHandler(error) {
  if (error.message === 'jwt expired') {
    const newError = new Error('Token expired');
    newError.statusCode = 401;
    return newError;
  } else if (error.message === 'jwt malformed') {
    const newError = new Error('Malformed token');
    newError.statusCode = 400;
    return newError;
  } else {
    const newError = new Error('Invalid token');
    newError.statusCode = 401;
    return newError;
  }
};
