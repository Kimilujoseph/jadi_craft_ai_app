import BaseError from '../utils/errors/BaseError.js';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
};

export default errorHandler;