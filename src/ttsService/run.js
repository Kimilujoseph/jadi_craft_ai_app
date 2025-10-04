// src/ttsService/run.js

import path from "path";
// Correct import path for the service file (index.js is side-by-side)
import ttsService from "./index.js"; 

// Correct import paths for config and errors (needed for test logging)
import { ELEVENLABS_API_KEY } from "../utils/config.js"; 
import ApiError from "../utils/errors/ApiError.js";

const testText = "Narrate a story about the origin of the Maasai people, their culture, traditions, and way of life in East Africa.The Maasai are known for their distinctive customs, dress, and semi-nomadic lifestyle.";

/**
 * Executes a quick test of the TTS service and logs the result.
 */
async function quickTest() {
  console.log(" Starting TTS Service Test...");
  console.log(" API Key status:", ELEVENLABS_API_KEY ? "Loaded" : "MISSING!");

  try {
    console.log(" Testing with text:", testText);
    const result = await ttsService.synthesize(testText);
    console.log("\n✅ SUCCESS! Audio file created:", result);
    // Path resolution here helps verify the output location
    console.log(" Full path:", path.resolve(process.cwd(), 'public', result));
  } catch (error) {
    // Check for specific ApiError types for better reporting
    const status = (error instanceof ApiError) ? ` (Status: ${error.statusCode})` : '';
    console.error(`\n❌ TEST FAILED${status}:`, error.message);
  }
}

// Execute the test function
quickTest();