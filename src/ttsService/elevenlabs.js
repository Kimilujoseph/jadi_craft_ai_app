import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Replace with any voice you want from your ElevenLabs dashboard
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // default: Rachel

/**
 * Call ElevenLabs TTS API
 * @param {string} text
 * @returns {Promise<string>} path to saved audio file
 */
export async function queryTTS(text) {
  console.log(`Using ElevenLabs voice: ${VOICE_ID}`);

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

  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs API error:", err);
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filePath = `tts_output_${Date.now()}.mp3`;
  fs.writeFileSync(filePath, buffer);
  console.log(`Audio saved: ${filePath}`);
  return filePath;
}

