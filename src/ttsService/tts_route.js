

import express from "express";
import ttsService from "../ttsService/index.js";

const router = express.Router();

/**
 * @route POST /api/v1/tts
 * @desc Convert text to speech and return audio file URL
 * @body { text: string }
 */
router.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    // Generate speech using your TTS service
    const audioUrl = await ttsService.synthesize(text);

    // Respond with the URL for the generated audio file
    return res.json({ audioUrl });
  } catch (err) {
    console.error("TTS API error:", err.message);
    return res.status(500).json({ error: "Failed to generate audio" });
  }
});

export default router;
