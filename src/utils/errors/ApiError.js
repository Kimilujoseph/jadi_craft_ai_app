import BaseError from './BaseError.js';

class ApiError extends BaseError {
  constructor(message, statusCode) {
    super(message, statusCode);
  }
}

export default ApiError;
