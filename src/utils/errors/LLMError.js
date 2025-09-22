import ServiceError from './ServiceError.js';

class LLMError extends ServiceError {
  constructor(message = 'LLM Service Error') {
    super(message, 503);
  }
}

export default LLMError;
