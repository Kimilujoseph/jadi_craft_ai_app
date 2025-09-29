// src/llm/LLMProvider.js
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch"; // only needed if Node < 18
import LLMError from "../utils/errors/LLMError.js";
import withTimeout from "../utils/withTimeout.js";

const LLM_TIMEOUT = 10000;          // 10s for primary
const LLM_TIMEOUT_FALLBACK = 5000;  // 5s for fallback

class LLMProvider {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.hfKey = process.env.HuggingFace_API_KEY;

    if (!this.geminiKey || !this.hfKey) {
      console.warn("⚠️ Missing one or more LLM API keys in .env. LLM functionality will be disabled.");
      //throw new LLMError("❌ Missing one or more LLM API keys in .env");
    }

    this.callPrimary = this.callPrimary.bind(this);
    this.callFallback = this.callFallback.bind(this);
  }

  /**
   * Main entry point: generate text with fallback.
   * @param {string} prompt
   */
  async generateText(prompt) {
    return this.tryWithFallback({
      primary: { fn: this.callPrimary, timeout: LLM_TIMEOUT },
      fallback: { fn: this.callFallback, timeout: LLM_TIMEOUT_FALLBACK },
      prompt,
    });
  }

  /**
   * Try primary LLM, then fallback if needed.
   */
  async tryWithFallback({ primary, fallback, prompt }) {
    const primaryCall = withTimeout(primary.fn, primary.timeout);

    try {
      const result = await primaryCall(prompt);
      console.log("✅ Primary LLM (Gemini) succeeded");
      return { text: result, fallbackUsed: false };
    } catch (primaryError) {
      console.warn("⚠️ Primary LLM failed:", primaryError.message);

      if (!fallback) throw new LLMError("Primary AI service is unavailable.");

      const fallbackCall = withTimeout(fallback.fn, fallback.timeout);

      try {
        const result = await fallbackCall(prompt);
        console.log("✅ Fallback LLM (Hugging Face) succeeded");
        return { text: result, fallbackUsed: true };
      } catch (fallbackError) {
        console.error("❌ Both LLMs failed:", fallbackError.message);
        throw new LLMError("Both primary and fallback AI services are unavailable.");
      }
    }
  }

  /**
   * Primary: Google Gemini
   */
  async callPrimary(prompt) {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.geminiKey}`,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API failed: ${response.status} - ${errorText.substring(0, 100)}...`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Gemini returned no text content.");
    }

    return generatedText;
  }

  /**
   * Fallback: Hugging Face Inference API
   * (Replace `gpt2` with a stronger model, e.g., `tiiuae/falcon-7b-instruct`)
   */
  async callFallback(prompt) {
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API failed: ${response.status} - ${errorText.substring(0, 100)}...`);
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text;

    if (!generatedText) {
      throw new Error("Hugging Face returned no text content.");
    }

    return generatedText;
  }
}

const llmProvider = new LLMProvider();
export default llmProvider;
