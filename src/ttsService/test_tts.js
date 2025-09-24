import { ElevenLabsClient } from "elevenlabs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config(); // Load .env file

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice (Rachel)

// 🔹 Split long text into smaller chunks (API has length limits)
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

export async function synthesizeLongText(text, outputFile = "output.mp3") {
  console.log(" Splitting text for TTS...");
  const chunks = splitText(text);
  console.log(`  Split into ${chunks.length} chunk(s)`);

  const combinedAudio = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(` Processing chunk ${i + 1}/${chunks.length}...`);
    const stream = await client.generate({
      voice: VOICE_ID,
      model_id: "eleven_multilingual_v2",
      text: chunks[i],
      voice_settings: { stability: 0.3, similarity_boost: 0.7 },
      format: "mp3",
    });

    // Collect audio chunks from the stream
    const pieces = [];
    for await (const piece of stream) {
      pieces.push(piece);
    }
    combinedAudio.push(Buffer.concat(pieces));
  }

  // Ensure /public folder exists
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // Save final audio file to /public
  const outputPath = path.join(publicDir, outputFile);
  fs.writeFileSync(outputPath, Buffer.concat(combinedAudio));
  console.log(`Audio saved at: ${outputPath}`);
  console.log(` Accessible at: http://localhost:3001/${outputFile}`);
}

// === TEST ===
if (process.argv[1].includes("test_tts.js")) {
  console.log("Testing ElevenLabs TTS with long text...");
  const longText = `I am a storyteller seeking to share the rich culture of my community using modern technology. I would like your platform to help me narrate tales of our heritage, translate them into Kiswahili and English, and present them as engaging audio stories so that young people and global audiences can experience our traditions while staying connected to the digital age. Please help me turn this vision into reality.`;
  synthesizeLongText(longText, "output.mp3").catch(console.error);
}
