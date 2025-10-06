// helpers/config.js

import dotenv from "dotenv";
// Load environment variables immediately
dotenv.config();

// --- Configuration Constants ---

/**
 * ElevenLabs API Key loaded from the .env file.
 * Used for authentication in the API caller.
 */
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/**
 * The fixed Voice ID for the TTS generation (Rachel voice).
 * Used in the API caller endpoint.
 */
export const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/**
 * The maximum time (in milliseconds) allowed for the entire TTS process.
 * Used by the withTimeout helper in index.js. (60 seconds)
 */
export const TTS_TIMEOUT = 60000; 

/**
 * The maximum number of characters per API request.
 * ElevenLabs recommends keeping chunks under this limit.
 * Used by the text-splitter.js helper.
 */
export const MAX_CHUNK_LENGTH = 2000;