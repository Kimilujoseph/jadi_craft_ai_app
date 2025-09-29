import BaseError from '../utils/errors/BaseError.js';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof BaseError) {
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
    const response = {
      success: false,
      error: err.message,
    };
    if (err.errors) {
      response.errors = err.errors;
    }
    return res.status(statusCode).json(response);
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
};

export default errorHandler;