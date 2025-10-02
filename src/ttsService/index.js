
import path from "path";

// --- Configuration, Timeout, and Error Handling Imports 
import { ELEVENLABS_API_KEY, TTS_TIMEOUT, MAX_CHUNK_LENGTH } from "../utils/config.js";
import withTimeout from "../utils/withTimeout.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";

// Specialized error imports
import ApiError from "../utils/errors/ApiError.js";
import TTSError from "../utils/errors/TTSError.js";

// --- Functional Helper Imports 
import { setupAudioDirectory } from "../utils/setup.js";
import { splitText } from "../utils/textsplitter.js";
import { queryTTSChunk } from "../utils/tts-api-caller.js";
import { saveAudioFile, cleanupOldFiles } from "../utils/file-manager.js";

setupAudioDirectory();

/**
 * Main TTSService Class - The central orchestrator.
 */
class TTSService {

  async _actualSynthesize(text) {

    try {
      let audioBufferOrBuffers;

      if (text.length <= MAX_CHUNK_LENGTH) {
        console.log("Processing as single chunk (short text)");
        audioBufferOrBuffers = await queryTTSChunk(text, ELEVENLABS_API_KEY);
      } else {
        console.log("Processing as multiple chunks (long text)");
        const chunks = splitText(text);
        console.log(`Split into ${chunks.length} chunk(s)`);

        const chunkBuffers = [];
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
          const chunkBuffer = await queryTTSChunk(chunks[i], ELEVENLABS_API_KEY);
          chunkBuffers.push(chunkBuffer);
        }
        audioBufferOrBuffers = chunkBuffers;
      }

      const audioPath = saveAudioFile(audioBufferOrBuffers);
      console.log(`Audio saved: ${audioPath}`);
      return audioPath;

    } catch (err) {
      console.error("Error in core synthesis flow:", err);
      throw err;
    }
  }


  async synthesize(text) {
    if (!ELEVENLABS_API_KEY) {
      throw new ApiError("ElevenLabs API Key is missing.", httpStatusCodes.INTERNAL_SERVER);
    }

    console.log(`Synthesizing audio: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

    const synthesizeWithTimeout = withTimeout(this._actualSynthesize.bind(this), TTS_TIMEOUT);

    try {
      const audioPath = await synthesizeWithTimeout(text);
      return audioPath;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("TTS Service failed or timed out unexpectedly:", error.message);
      // Throw the specialized TTSError for service-level failure/timeout
      throw new TTSError("Text-to-Speech generation failed or timed out.");
    }
  }

  cleanupOldFiles(maxAgeHours = 24) {
    cleanupOldFiles(maxAgeHours);
  }
}

const ttsService = new TTSService();
ttsService.cleanupOldFiles();
export default ttsService;

console.log(" Starting TTS Service Test...");
console.log(" API Key status:", ELEVENLABS_API_KEY ? "Loaded" : "MISSING!");

// NEW TEST TEXT - More interesting content to hear the voice quality
const testText = "Welcome to the future of storytelling! With advanced text-to-speech technology, we can bring stories to life in ways never before possible. Imagine listening to ancient tales narrated by crystal-clear AI voices, available anytime, anywhere. This technology bridges generations and preserves cultural heritage for the digital age.";

// async function quickTest() {
//   try {
//     console.log(" Testing with text:", testText);
//     console.log(" Please wait while we generate the audio...");

//     // This is the main call that converts text to speech
//     const result = await ttsService.synthesize(testText);

//     console.log(" SUCCESS! Audio file created:", result);
//     console.log(" Full path:", path.resolve(process.cwd(), 'public', result));
//     console.log(" You can now play the audio file!");

//   } catch (error) {
//     console.error(" TEST FAILED:", error.message);
//   }
// }

// // Run the test immediately when this file is executed
// quickTest();