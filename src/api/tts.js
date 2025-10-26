
import fetch from "node-fetch";         
import dotenv from "dotenv";           
import fs from "fs";                     
import path from "path";                
import crypto from "crypto";            

dotenv.config();

// Load API key from environment variables
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice ID from ElevenLabs
const TTS_TIMEOUT = 60000; // Timeout duration for API calls (60 seconds)

// Ensure audio directory exists (to store generated audio files)
const audioDirectory = path.resolve(process.cwd(), "public/audio");
if (!fs.existsSync(audioDirectory)) {
  fs.mkdirSync(audioDirectory, { recursive: true }); // Create folder if missing
}

/**
 * Split long text into smaller chunks
 * Prevents hitting ElevenLabs API character limit.
 * @param {string} text - Input text
 * @param {number} maxLength - Max characters per chunk (default: 2000)
 * @returns {string[]} - Array of text chunks
 */
function splitText(text, maxLength = 2000) {
  const chunks = [];
  let current = "";

  text.split(/\s+/).forEach((word) => {
    if ((current + " " + word).length > maxLength) {
      chunks.push(current);
      current = word;
    } else {
      current += (current ? " " : "") + word;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Generate a unique filename for each audio file
 * Uses timestamp + random hash to avoid overwriting files.
 * @returns {string} - Filename for audio file
 */
function generateUniqueFilename() {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(4).toString("hex");
  return `tts_${timestamp}_${randomHash}.mp3`;
}

/**
 * Send a single text chunk to ElevenLabs API for TTS
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} - Audio data as binary buffer
 */
async function queryTTSChunk(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${err}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Utility: Wrap a function with a timeout
 * Prevents requests from hanging forever.
 * @param {Function} fn - Function to wrap
 * @param {number} ms - Timeout duration
 * @returns {Function} - Wrapped function
 */
function withTimeout(fn, ms) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject(new Error(`Operation timed out after ${ms}ms`)),
        ms
      );

      fn(...args)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };
}

/**
 * TTS Service Class
 * Handles text-to-speech requests, chunking, and file saving.
 */
class TTSService {
  constructor() {
    // Bind private method so it works correctly inside withTimeout()
    this._actualSynthesize = this._actualSynthesize.bind(this);
  }

  /**
   * Public method: Convert text to speech
   * Includes timeout protection.
   * @param {string} text - Input text
   * @returns {Promise<string>} - Relative path to saved audio file
   */
  async synthesize(text) {
    const synthesizeWithTimeout = withTimeout(
      this._actualSynthesize,
      TTS_TIMEOUT
    );

    try {
      return await synthesizeWithTimeout(text);
    } catch (error) {
      throw new Error("TTS_FAILED: " + error.message);
    }
  }

  /**
   * Private method: Actual synthesis logic
   * Splits text if too long, calls ElevenLabs API, saves audio file.
   * @param {string} text - Text to synthesize
   * @returns {Promise<string>} - Path to saved audio file
   */
  async _actualSynthesize(text) {
    const filename = generateUniqueFilename();
    const filePath = path.join(audioDirectory, filename);

    if (text.length <= 2000) {
      // Short text → single request
      const audioBuffer = await queryTTSChunk(text);
      fs.writeFileSync(filePath, audioBuffer);
    } else {
      // Long text → split into chunks
      const chunks = splitText(text);
      const combinedAudio = [];
      for (const chunk of chunks) {
        const buffer = await queryTTSChunk(chunk);
        combinedAudio.push(buffer);
      }
      fs.writeFileSync(filePath, Buffer.concat(combinedAudio));
    }

    return `/audio/${filename}`; // Relative path for frontend
  }

  /**
   * Clean up old audio files
   * Prevents the "public/audio" folder from growing indefinitely.
   * @param {number} maxAgeHours - Max file age (default: 24h)
   */
  cleanupOldFiles(maxAgeHours = 24) {
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    const now = Date.now();

    try {
      const files = fs.readdirSync(audioDirectory);
      files.forEach((file) => {
        if (file.startsWith("tts_") && file.endsWith(".mp3")) {
          const filePath = path.join(audioDirectory, file);
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Deleted old audio file: ${file}`);
          }
        }
      });
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }
}

// Create a single instance of the service
const ttsService = new TTSService();

// Run cleanup when the service starts
ttsService.cleanupOldFiles();

// Export service for use in other parts of the app
export default ttsService;
