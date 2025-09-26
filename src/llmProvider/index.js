// src/llm/LLMProvider.js
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch"; // if using Node <18, otherwise global fetch exists
import LLMError from "../utils/errors/LLMError.js";
import withTimeout from "../utils/withTimeout.js";

const LLM_TIMEOUT = 10000;        // 10s for primary (Gemini)
const LLM_TIMEOUT_FALLBACK = 5000; // 5s for fallback (HuggingFace)

class LLMProvider {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.hfKey = process.env.HUGGINGFACE_API_KEY;

    if (!this.geminiKey || !this.hfKey) {
      throw new Error("Missing one or more LLM API keys in .env");
    }

    // Bind functions so context isn't lost when passed as callbacks
    this.callPrimary = this.callPrimary.bind(this);
    this.callFallback = this.callFallback.bind(this);
  }

  async generateText(prompt) {
    return this.tryWithFallback({
      primary: { fn: this.callPrimary, timeout: LLM_TIMEOUT },
      fallback: { fn: this.callFallback, timeout: LLM_TIMEOUT_FALLBACK },
      prompt,
    });
  }

  async tryWithFallback({ primary, fallback, prompt }) {
    const primaryCall = withTimeout(primary.fn, primary.timeout);

    try {
      const result = await primaryCall(prompt);
      return { text: result, fallbackUsed: false };
    } catch (primaryError) {
      console.warn("Primary failed:", primaryError.message);

      if (!fallback) {
        throw new LLMError("Primary AI service is unavailable.");
      }

      const fallbackCall = withTimeout(fallback.fn, fallback.timeout);

      try {
        const result = await fallbackCall(prompt);
        return { text: result, fallbackUsed: true };
      } catch (fallbackError) {
        throw new LLMError("Both primary and fallback AI services are unavailable.");
      }
    }
  }

  // --- Primary: Gemini ---
  async callPrimary(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini failed: ${response.status}`);
    const data = await response.json();

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
  }

  // --- Fallback: HuggingFace ---
  async callFallback(prompt) {
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) throw new Error(`HuggingFace failed: ${response.status}`);
    const data = await response.json();

    return data[0]?.generated_text || "No response from HuggingFace";
  }
}

const llmProvider = new LLMProvider();
export default llmProvider;
