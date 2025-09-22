import BaseError from './BaseError.js';

class ServiceError extends BaseError {
  constructor(message, statusCode) {
    super(message, statusCode);
  }
}

export default ServiceError;
