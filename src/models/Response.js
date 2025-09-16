/**
 * Represents the final response sent to the client.
 */
export default class Response {
  /**
   * @param {string} text The main text answer.
   * @param {string|null} audioUrl The URL for the audio file, or null.
   * @param {boolean} fallbackUsed Whether a fallback LLM was used.
   * @param {string|null} error An error message, or null.
   */
  constructor(text, audioUrl = null, fallbackUsed = false, error = null) {
    this.text = text;
    this.audioUrl = audioUrl;
    this.fallbackUsed = fallbackUsed;
    this.error = error;
  }
}