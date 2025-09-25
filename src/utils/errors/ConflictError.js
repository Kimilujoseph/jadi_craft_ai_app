import ApiError from './ApiError.js';

class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export default ConflictError;
