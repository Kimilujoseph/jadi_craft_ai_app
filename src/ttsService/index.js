import ErrorHandler from "../utils/ErrorHandler.js";
import withTimeout from "../utils/withTimeout.js";
import { queryTTS } from "./elevenlabs.js";

const TTS_TIMEOUT = 60000; // 60 sec

class TTSService {
  constructor() {
    this._actualSynthesize = this._actualSynthesize.bind(this);
  }

  /**
   * Synthesizes text to speech (ElevenLabs) with timeout
   * @param {string} text
   * @returns {Promise<string>} Path to saved audio file
   */

  async synthesize(text) {
    console.log(`Synthesizing audio: "${text}"`);
    const synthesizeWithTimeout = withTimeout(this._actualSynthesize, TTS_TIMEOUT);

    // Call the TTS function with timeout
    try {
      const audioPath = await synthesizeWithTimeout(text);
      return audioPath;
    } catch (error) {
      console.error("TTS Service failed or timed out:", error.message);
      throw new Error("TTS_FAILED");
    }
  }


  async _actualSynthesize(text) {
    try {
      const filePath = await queryTTS(text);
      return filePath;
    } catch (err) {
      console.error("Error in ElevenLabs TTS:", err);
      throw new ErrorHandler("TTS API Error", 500);
    }
  }
}

const ttsService = new TTSService();
export default ttsService;
