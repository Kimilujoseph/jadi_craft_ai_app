import ErrorHandler from '../utils/ErrorHandler.js';
import withTimeout from '../utils/withTimeout.js';

const LLM_TIMEOUT = 10000; // 10 seconds

class LLMProvider {
  constructor() {
    // Bind the context of 'this' for the method that will be passed to the utility
    this.callPrimary = this.callPrimary.bind(this);
  }

  async generateText(prompt) {
    console.log(`Generating text for prompt: "${prompt}"`);

    try {
      // Create a function that calls the primary LLM with a timeout
      const primaryCallWithTimeout = withTimeout(this.callPrimary, LLM_TIMEOUT);
      const result = await primaryCallWithTimeout(prompt);
      return { text: result, fallbackUsed: false };
    } catch (error) {
      console.error('Primary LLM failed or timed out:', error.message);
      console.log('Trying fallback LLM.');
      // If the primary fails or times out, try the fallback
      return this.callFallback(prompt);
    }
  }

  // A placeholder for the actual primary LLM call
  async callPrimary(prompt) {

    const executionTime = Math.random() * 15000; // 0 to 15 seconds
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('This is a response from the primary LLM.');
      }, executionTime);
    });
  }

  async callFallback(prompt) {
    console.log('Calling fallback LLM.');
    try {
      const result = await new Promise(resolve => setTimeout(() => resolve('This is a response from the fallback LLM.'), 1000));
      return { text: result, fallbackUsed: true };
    } catch (fallbackError) {
      console.error('Fallback LLM also failed:', fallbackError.message);
      throw new ErrorHandler('Both primary and fallback AI services are unavailable.', 503);
    }
  }
}

const llmProvider = new LLMProvider();
export default llmProvider;