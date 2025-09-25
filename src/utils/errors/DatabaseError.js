import ServiceError from './ServiceError.js';

class DatabaseError extends ServiceError {
  constructor(message = 'Database Error') {
    super(message, 500);
  }
}

export default DatabaseError;
