import TTSError from '../utils/errors/TTSError.js';
import withTimeout from '../utils/withTimeout.js';
import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const TTS_TIMEOUT = 75000; // 15 seconds, allowing for network and generation time

class TTSService {
  constructor() {
    this._actualSynthesize = this._actualSynthesize.bind(this);
    this.audioDirectory = path.resolve(process.cwd(), 'public/audio');
  }

  async synthesize(text) {
    console.log(`Synthesizing audio for text: "${text}"`);
    const synthesizeWithTimeout = withTimeout(this._actualSynthesize, TTS_TIMEOUT);

    try {
      const audioUrl = await synthesizeWithTimeout(text);
      console.log(`Successfully generated audio: ${audioUrl}`);
      return audioUrl;
    } catch (error) {
      console.error('TTS Service failed or timed out:', error.message);
      throw new TTSError('TTS_FAILED', { originalError: error.message });
    }
  }

  async _actualSynthesize(text) {
    try {
      // In a real app, this URL and configuration would come from environment variables/config
      const ttsApiUrl = 'http://localhost:5003/tts'; // Placeholder TTS service

      const response = await axios.post(
        ttsApiUrl,
        {
          input: { text },
          // Example voice and audio config, adjust for your TTS provider
          voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
          audioConfig: { audioEncoding: 'MP3' },
        },
        {
          responseType: 'arraybuffer', // Crucial for receiving audio data
        }
      );

      // Create a unique filename to avoid collisions and redundant generation
      const hash = crypto.createHash('md5').update(text).digest('hex');
      const filename = `${hash}.mp3`;
      const filePath = path.join(this.audioDirectory, filename);

      // Save the received audio buffer to the public directory
      fs.writeFileSync(filePath, response.data);

      // Return the public URL that the client can use to access the audio
      return `/audio/${filename}`;
    } catch (error) {
      // Provide a detailed error message to be wrapped by the public `synthesize` method's TTSError
      const errorMessage = error.response
        ? `API responded with status ${error.response.status}`
        : error.message;
      throw new Error(`TTS API request failed: ${errorMessage}`);
    }
  }
}

const ttsService = new TTSService();
export default ttsService;