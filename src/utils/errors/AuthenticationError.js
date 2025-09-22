import ApiError from './ApiError.js';

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication Failed') {
    super(message, 401);
  }
}

export default AuthenticationError;
