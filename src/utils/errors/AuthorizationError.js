import ApiError from './ApiError.js';

class AuthorizationError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export default AuthorizationError;
