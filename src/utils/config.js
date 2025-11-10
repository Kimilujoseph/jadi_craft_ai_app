
import dotenv from "dotenv";

dotenv.config();

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export const TTS_TIMEOUT = 60000;

export const MAX_CHUNK_LENGTH = 12000;