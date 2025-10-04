import fs from "fs";
import path from "path";

export function setupAudioDirectory() {
  
  const audioDirectory = path.resolve(process.cwd(), 'public/audio'); 
  
  if (!fs.existsSync(audioDirectory)) {
    console.log(`Creating audio directory: ${audioDirectory}`);
    fs.mkdirSync(audioDirectory, { recursive: true });
  }
  return audioDirectory;
}