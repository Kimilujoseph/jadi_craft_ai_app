

import fs from "fs";
import path from "path";

/**
 * Initializes the required audio directory.
 */
export function setupAudioDirectory() {
  // Path is relative to the process execution (often the project root)
  const audioDirectory = path.resolve(process.cwd(), 'public/audio'); 
  
  if (!fs.existsSync(audioDirectory)) {
    console.log(`Creating audio directory: ${audioDirectory}`);
    fs.mkdirSync(audioDirectory, { recursive: true });
  }
  return audioDirectory;
}