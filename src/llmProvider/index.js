
import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch"; // only needed if Node < 18
import LLMError from "../utils/errors/LLMError.js";
import withTimeout from "../utils/withTimeout.js";

const LLM_TIMEOUT = 20000;          // 20s for primary (Note: This was 10s in original code but 20s in your latest code)
const LLM_TIMEOUT_FALLBACK = 5000;  // 5s for fallback

class LLMProvider {
    constructor() {
        this.geminiKey = process.env.GEMINI_API_KEY;
        this.hfKey = process.env.HuggingFace_API_KEY;
        this.hfModel = process.env.HF_MODEL; // configurable model

        if (!this.geminiKey || !this.hfKey) {
            throw new LLMError("❌ Missing one or more LLM API keys in .env");
        }

        this.callPrimary = this.callPrimary.bind(this);
        this.callFallback = this.callFallback.bind(this);
        this.callPrimaryForText = this.callPrimaryForText.bind(this);
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
     * Entry point for generating a summary.
     * @param {string} prompt
     */
    async generateSummary(prompt) {
        // For summaries, we'll just use the primary provider without fallback for simplicity.
        try {
            const summary = await this.callPrimaryForText(prompt);
            console.log("✅ Summary generation succeeded");
            return summary;
        } catch (error) {
            console.error("❌ Summary generation failed:", error.message);
            // In a real app, you might want a more robust retry or a silent failure.
            throw new LLMError("Failed to generate summary.");
        }
    }

    /**
     * Try primary LLM, then fallback if needed.
     */
    async tryWithFallback({ primary, fallback, prompt }) {
        const primaryCall = withTimeout(primary.fn, primary.timeout);

        try {
            const result = await primaryCall(prompt);
            console.log("✅ Primary LLM (Gemini) succeeded");
            // The primary now returns an object with fullAnswer and precis
            return { text: result.fullAnswer, precis: result.precis, fallbackUsed: false };
        } catch (primaryError) {
            console.warn("⚠️ Primary LLM failed:", primaryError.message);

            if (!fallback) throw new LLMError("Primary AI service is unavailable.");

            const fallbackCall = withTimeout(fallback.fn, fallback.timeout);

            try {
                const result = await fallbackCall(prompt);
                console.log("✅ Fallback LLM (Hugging Face) succeeded");
                // Fallback returns only text, so precis is null
                return { text: result, precis: null, fallbackUsed: true };
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
        const structuredPrompt = `
      You are an **expert cultural storyteller and educational assistant**. Your goal is to provide knowledge that is perfect for an immersive and engaging audio segment.

      **GUIDELINES FOR THE "fullAnswer":**
      1.  **Language:** Use **rich, descriptive, and accessible language**. Avoid jargon.
      2.  **Flow:** Structure the answer with a **compelling story-like flow**. It should have a clear beginning, middle, and end.
      3.  **Length:** The response should be **detailed and rich with context**, like a short, immersive story. Aim for a natural speaking time of about 2-3 minutes. Do not be overly brief; prioritize depth and narrative flow.

      Please provide the full answer following these guidelines in the "fullAnswer" key.
      Also, provide a **very short, one-sentence summary** for the "precis" key.
      
      **Respond ONLY with a valid JSON object with two keys: "fullAnswer" and "precis".**

      Prompt:
      ---
      ${prompt}
      ---
    `;

        const response = await this.fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: structuredPrompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMError(`Gemini API failed: ${response.status} - ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new LLMError("Gemini returned no text content.");
        }

        try {
            const parsed = JSON.parse(generatedText);
            if (!parsed.fullAnswer || !parsed.precis) {
                throw new LLMError("Gemini response is missing 'fullAnswer' or 'precis' keys.");
            }
            return { fullAnswer: parsed.fullAnswer, precis: parsed.precis };
        } catch (e) {
            console.error("Error parsing JSON from Gemini:", e);
            throw new LLMError("Failed to parse JSON response from Gemini.");
        }
    }

    /**
     * Simplified Primary Call for Plain Text (for summaries)
     */
    async callPrimaryForText(prompt) {
        const response = await this.fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMError(`Gemini API failed: ${response.status} - ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new LLMError("Gemini returned no text content for summary.");
        }

        return generatedText;
    }

    async callFallback(prompt) {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.hfKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.hfModel,
                messages: [{ "role": "user", "content": prompt }]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMError(`Hugging Face API failed: ${response.status} - ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content;

        if (!generatedText) {
            throw new LLMError("Hugging Face returned no text content.");
        }

        return generatedText;
    }

    async fetchWithRetry(url, options, maxRetries = 4, initialDelay = 2000) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const response = await fetch(url, options);
                if (response.status === 429 && attempt < maxRetries - 1) {
                    const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
                    //console.warn(`Gemini API rate limited. Retrying in ${Math.round(delay / 1000)}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    attempt++;
                    continue;
                }
                return response;
            } catch (error) {
                if (attempt < maxRetries - 1) {
                    const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
                    console.warn(`Fetch failed. Retrying in ${Math.round(delay / 1000)}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    attempt++;
                    continue;
                }
                throw error;
            }
        }
        throw new LLMError(`Gemini API failed after ${maxRetries} retries.`);
    }


}

const llmProvider = new LLMProvider();
export default llmProvider;