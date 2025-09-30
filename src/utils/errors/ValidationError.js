import BaseError from './BaseError.js';
import httpStatusCodes from '../../utils/httpStatusCodes.js';

class ValidationError extends BaseError {
  constructor(
    errors,
    message = 'Input validation failed.',
    statusCode = httpStatusCodes.UNPROCESSABLE_ENTITY // 422
  ) {
    super(message, statusCode);
    this.errors = errors; // The array of validation errors
  }
}

export default ValidationError;
