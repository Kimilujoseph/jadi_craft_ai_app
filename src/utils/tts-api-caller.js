
import fetch from "node-fetch";
import { VOICE_ID } from "./config.js";
import ApiError from "./errors/ApiError.js";

export async function queryTTSChunk(text, apiKey) {
  console.log(`Synthesizing text chunk (${text.length} chars)...`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
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
    throw new ApiError(`ElevenLabs API error: ${response.statusText}`, response.status);
  }

  return Buffer.from(await response.arrayBuffer());
}