module.exports = (err, req, res, next) => {
  if (err) {
    if (process.env.NODE_ENV !== 'test') console.error(err);
    const status = err.statusCode || 500;
    res.status(status).json({
      errors: err.messages || ['Internal Server Error'],
    });
  } else {
    next();
  }
};
