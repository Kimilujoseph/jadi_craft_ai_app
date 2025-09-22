import LLMError from '../utils/errors/LLMError.js';
import withTimeout from '../utils/withTimeout.js';

const LLM_TIMEOUT = 10000;
const LLM_TIMEOUT_FALLBACK = 5000;

class LLMProvider {
  constructor() {
    //so don't be confused with the this context
    //we are passing this.callPrimary as a callback(withTimeout),so for us not loose the context of this
    //we explicitly bound it to this
    //for more info text me
    this.callPrimary = this.callPrimary.bind(this);
    this.callFallback = this.callFallback.bind(this);
  }

  async generateText(prompt) {
    return this.tryWithAfallBack({
      primary: { fn: this.callPrimary, timeOut: LLM_TIMEOUT },
      fallback: { fn: this.callFallback, timeOut: LLM_TIMEOUT_FALLBACK },
      prompt
    });
  }

  async tryWithAfallBack({ primary, fallback, prompt }) {
    const primaryCallWithTimeout = withTimeout(primary.fn, primary.timeout);
    try {
      const result = await primaryCallWithTimeout(prompt);
      return { text: result, fallbackUsed: false };
    }
    catch (primaryError) {
      if (!fallback) {
        throw new LLMError('Primary AI service is unavailable.');
      }
      const fallbackCallWithTimeout = withTimeout(fallback.fn, fallback.timeOut);
      try {
        const result = await fallbackCallWithTimeout(prompt);
        return { text: result, fallbackUsed: true }
      } catch (fallbackerror) {
        throw new LLMError('Both primary and fallback AI services are unavailable.');
      }
    }
  }

  async callPrimary(prompt) {
    // Simulate network latency (or replace with a real API call, e.g., fetch/axios)
    const executionTime = Math.random() * 15000;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("This is a response from the primary LLM.");
      }, executionTime);
    });
  }

  async callFallback(prompt) {
    const executionTime = Math.random() * 15000;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("This is a response from the primary LLM.");
      }, executionTime);
    });
  }
}

const llmProvider = new LLMProvider();
export default llmProvider;