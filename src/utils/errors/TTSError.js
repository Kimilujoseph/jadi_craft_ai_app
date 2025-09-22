import ServiceError from './ServiceError.js';

class TTSError extends ServiceError {
  constructor(message = 'TTS Service Error') {
    super(message, 503);
  }
}

export default TTSError;
