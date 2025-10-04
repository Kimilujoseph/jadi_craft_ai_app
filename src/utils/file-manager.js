

import fs from "fs";
import path from "path";
import crypto from "crypto";

const audioDirectory = path.resolve(process.cwd(), 'public/audio');

function generateUniqueFilename() {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(4).toString('hex');
  return `tts_${timestamp}_${randomHash}.mp3`;
}

export function saveAudioFile(audioData) {
  const filename = generateUniqueFilename();
  const filePath = path.join(audioDirectory, filename);
  
  const combinedAudio = Array.isArray(audioData) ? Buffer.concat(audioData) : audioData;

  fs.writeFileSync(filePath, combinedAudio);
  return `/audio/${filename}`;
}

export function cleanupOldFiles(maxAgeHours = 24) {

}