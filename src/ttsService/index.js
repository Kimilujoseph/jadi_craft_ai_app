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
    const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY;
    if (!SPEECHIFY_API_KEY) {
      throw new TTSError('SPEECHIFY_API_KEY environment variable not set.');
    }

    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const filePath = path.join(this.audioDirectory, `${hash}.mp3`);
    const publicUrl = `/audio/${hash}.mp3`;

    if (fs.existsSync(filePath)) {
      console.log('Serving TTS audio from cache:', publicUrl);
      return publicUrl;
    }

    console.log('Generating new TTS audio, not found in cache.');
    const response = await axios.post(
      "https://api.sws.speechify.com/v1/audio/tts",
      {
        input: [
          {
            text: text,
          },
        ],
        voice_id: "Matthew",
        audio_format: "mp3",
      },
      {
        headers: {
          Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(publicUrl));
      writer.on('error', (err) => {
        // Clean up broken file
        fs.unlink(filePath, () => reject(new TTSError('Failed to save audio file.')));
      });
    });
  }
}

const ttsService = new TTSService();
export default ttsService;