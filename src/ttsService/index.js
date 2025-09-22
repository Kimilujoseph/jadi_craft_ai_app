import TTSError from '../utils/errors/TTSError.js';
import withTimeout from '../utils/withTimeout.js';

const TTS_TIMEOUT = 7000; // 7 seconds

class TTSService {
  constructor() {
    this._actualSynthesize = this._actualSynthesize.bind(this);
  }

  /**
   * Synthesizes text to audio with a timeout.
   * @param {string} text The text to convert to audio.
   * @returns {Promise<string>} The URL of the generated audio file.
   */
  async synthesize(text) {
    console.log(`Synthesizing audio for text: "${text}"`);
    const synthesizeWithTimeout = withTimeout(this._actualSynthesize, TTS_TIMEOUT);

    try {
      const audioUrl = await synthesizeWithTimeout(text);
      return audioUrl;
    } catch (error) {
      console.error('TTS Service failed or timed out:', error.message);
      // The orchestrator is designed to catch this and handle it gracefully
      // by setting a flag, so we re-throw the error.
      throw new TTSError('TTS_FAILED');
    }
  }

  /**
   * Internal method to perform the actual TTS API call.
   * @param {string} text
   * @returns {Promise<string>}
   * @private
   */
  async _actualSynthesize(text) {
    // Simulate a TTS API call that might be slow
    const executionTime = Math.random() * 10000; // 0 to 10 seconds
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('https://example.com/audio.mp3');
      }, executionTime);
    });
  }
}

const ttsService = new TTSService();
export default ttsService;