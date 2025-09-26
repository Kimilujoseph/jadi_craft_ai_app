import BaseError from './BaseError.js';
import httpStatusCodes from '../../utils/httpStatusCodes.js';

class RateLimitError extends BaseError {
  constructor(
    message = 'You have exceeded the rate limit for this feature.',
    statusCode = httpStatusCodes.TOO_MANY_REQUESTS
  ) {
    super(message, statusCode);
  }
}

export default RateLimitError;
