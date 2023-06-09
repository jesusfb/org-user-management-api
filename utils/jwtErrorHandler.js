module.exports = function jwtErrorHandler(error) {
  let errorMessage;

  switch (error.message) {
    case 'jwt expired':
      errorMessage = 'Token expired';
      break;
    case 'jwt malformed':
      errorMessage = 'Malformed token';
      break;
    default:
      errorMessage = 'Invalid token';
  }

  const newError = new Error(errorMessage);
  newError.statusCode = 401;

  return newError;
};
