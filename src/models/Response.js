/**
 * Represents the final response sent to the client.
 */
export default class Response {
  /**
   * @param {string} text The main text answer.
   * @param {string|null} audioUrl The URL for the audio file, or null.
   * @param {boolean} fallbackUsed Whether a fallback LLM was used.
   * @param {string|null} error An error message, or null.
   * @param {string|null} chatId The ID of the chat session.
   * @param {Array<object>} promotedLinks An array of promoted link objects.
   */
  constructor(text, audioUrl = null, fallbackUsed = false, error = null, chatId = null, promotedLinks = []) {
    this.text = text;
    this.audioUrl = audioUrl;
    this.fallbackUsed = fallbackUsed;
    this.error = error;
    this.chatId = chatId;
    this.promotedLinks = promotedLinks;
  }
}