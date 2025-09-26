
import fetch from "node-fetch";          // For making HTTP requests to ElevenLabs API
import dotenv from "dotenv";             // For loading environment variables from .env file
import fs from "fs";                     // For file system operations (reading/writing files)
import path from "path";                 // For handling file paths across different operating systems
import crypto from "crypto";             // For generating random filenames 


dotenv.config();


const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; 
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice ID from ElevenLabs
const TTS_TIMEOUT = 60000; // 60 seconds timeout for API calls

// Create audio directory if it doesn't exist
// This ensures we have a place to save the generated audio files
const audioDirectory = path.resolve(process.cwd(), 'public/audio');
if (!fs.existsSync(audioDirectory)) {
  fs.mkdirSync(audioDirectory, { recursive: true }); // Create directory and parent directories if needed
}

/**
 * Split long text into smaller chunks to avoid API limits
 * ElevenLabs API has character limits, so we need to break long texts into smaller pieces
 * @param {string} text - Text to split into chunks
 * @param {number} maxLength - Maximum characters per chunk (default: 2000)
 * @returns {string[]} Array of text chunks
 */
function splitText(text, maxLength = 2000) {
  const chunks = [];
  let current = "";  

  // Split text by words (spaces) to maintain readability
  // This prevents cutting words in the middle
  text.split(/\s+/).forEach((word) => {
    // Check if adding this word would exceed the max length
    if ((current + " " + word).length > maxLength) {
      chunks.push(current); // Save the current chunk
      current = word;       // Start new chunk with the current word
    } else {
      current += (current ? " " : "") + word; // Add word to current chunk
    }
  });
  
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Generate unique filename using crypto for better file distribution
 * This prevents filename collisions when multiple users generate audio simultaneously
 * @returns {string} Unique filename with timestamp and random hash
 */
function generateUniqueFilename() {
  const timestamp = Date.now(); 
  const randomHash = crypto.randomBytes(4).toString('hex'); 
  return `tts_${timestamp}_${randomHash}.mp3`; 
}

/**
 * Call ElevenLabs TTS API for a single text chunk
 * This function makes the actual API call to convert text to speech
 * @param {string} text - Text to synthesize into audio
 * @returns {Promise<Buffer>} Audio data as Buffer (binary data)
 */
async function queryTTSChunk(text) {
  console.log(`Synthesizing text chunk (${text.length} chars)...`);

  // Make POST request to ElevenLabs API
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY, 
        "Content-Type": "application/json",  
        Accept: "audio/mpeg"                 
      },
      body: JSON.stringify({
        text, 
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.3,       
          similarity_boost: 0.7 
        }
      })
    }
  );

  // Check if the API response is successful
  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs API error:", err);
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  // Convert the audio response to Buffer (binary data)
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Timeout wrapper utility - prevents API calls from hanging forever
 * @param {Function} fn - Function to wrap with timeout
 * @param {number} ms - Timeout duration in milliseconds
 * @returns {Function} Wrapped function that will timeout after specified ms
 */
function withTimeout(fn, ms) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      // Set up timeout timer
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);

      // Call the original function
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
 * Main TTS Service Class - Handles all text-to-speech operations
 */
class TTSService {
  constructor() {
    
    this._actualSynthesize = this._actualSynthesize.bind(this);
  }

  /**
   * Main synthesis method with timeout protection
   * This is the public method that users call
   * @param {string} text - Text to convert to speech
   * @returns {Promise<string>} Path to the saved audio file
   */
  async synthesize(text) {
    console.log(`Synthesizing audio: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    
    
    const synthesizeWithTimeout = withTimeout(this._actualSynthesize, TTS_TIMEOUT);

    try {
      const audioPath = await synthesizeWithTimeout(text);
      return audioPath;
    } catch (error) {
      console.error("TTS Service failed or timed out:", error.message);
      throw new Error("TTS_FAILED");
    }
  }

  /**
   * Actual synthesis logic with chunking and file management
   * This is where the real work happens - called by the public method
   * @param {string} text - Text to synthesize
   * @returns {Promise<string>} Path to saved audio file
   */
  async _actualSynthesize(text) {
    try {
      // Generate unique filename to prevent overwrites
      const filename = generateUniqueFilename();
      const filePath = path.join(audioDirectory, filename);

      // Optimization: Use single API call for short texts, chunk long texts
      if (text.length <= 2000) {
        console.log("Processing as single chunk (short text)");
        // Single API call for better performance
        const audioBuffer = await queryTTSChunk(text);
        fs.writeFileSync(filePath, audioBuffer); // Save audio to file
      } else {
        // For long texts, split into manageable chunks
        console.log("Processing as multiple chunks (long text)");
        const chunks = splitText(text);
        console.log(`Split into ${chunks.length} chunk(s)`);

        const combinedAudio = []; 
        
        // Process chunks one by one to maintain correct order
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
          const chunkBuffer = await queryTTSChunk(chunks[i]);
          combinedAudio.push(chunkBuffer); // Add each chunk's audio to array
        }

        // Combine all audio buffers into one file
        fs.writeFileSync(filePath, Buffer.concat(combinedAudio));
      }

      console.log(`Audio saved: ${filePath}`);
      
      // Return web-accessible path 
      // This path can be used in HTML audio tags: <audio src="/audio/filename.mp3">
      return `/audio/${filename}`;
      
    } catch (err) {
      console.error("Error in ElevenLabs TTS:", err);
      throw new Error(`TTS API Error: ${err.message}`);
    }
  }

  /**
   * Clean up old audio files to prevent storage overflow
   * Automatically removes files older than specified hours
   * @param {number} maxAgeHours - Maximum age in hours (default: 24 hours)
   */
  cleanupOldFiles(maxAgeHours = 24) {
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000; 
    const now = Date.now();

    try {
      const files = fs.readdirSync(audioDirectory);
      let cleanedCount = 0;

      // Check each file in the audio directory
      files.forEach(file => {
        // Only process TTS audio files
        if (file.startsWith('tts_') && file.endsWith('.mp3')) {
          const filePath = path.join(audioDirectory, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;

          // Delete if file is older than allowed age
          if (fileAge > maxAgeMs) {
            fs.unlinkSync(filePath); 
            cleanedCount++;
            console.log(`Cleaned up old file: ${file}`);
          }
        }
      });

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} old audio files`);
      }
    } catch (error) {
      console.error("Error cleaning up old files:", error);
    }
  }
}

// Create singleton instance 
const ttsService = new TTSService();

// Clean up old audio files
ttsService.cleanupOldFiles();

// Export the service so other files can use it
export default ttsService;

/
console.log(" Starting TTS Service Test...");
console.log(" API Key status:", ELEVENLABS_API_KEY ? "Loaded" : "MISSING!");

// NEW TEST TEXT - More interesting content to hear the voice quality
const testText = "Welcome to the future of storytelling! With advanced text-to-speech technology, we can bring stories to life in ways never before possible. Imagine listening to ancient tales narrated by crystal-clear AI voices, available anytime, anywhere. This technology bridges generations and preserves cultural heritage for the digital age.";

async function quickTest() {
  try {
    console.log(" Testing with text:", testText);
    console.log(" Please wait while we generate the audio...");
    
    // This is the main call that converts text to speech
    const result = await ttsService.synthesize(testText);
    
    console.log(" SUCCESS! Audio file created:", result);
    console.log(" Full path:", path.resolve(process.cwd(), 'public', result));
    console.log(" You can now play the audio file!");
    
  } catch (error) {
    console.error(" TEST FAILED:", error.message);
  }
}

// Run the test immediately when this file is executed
quickTest();