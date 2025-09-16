/**
 * Wraps a promise-based function with a timeout.
 * @param {Function} fn The async function to execute.
 * @param {number} timeoutMs The timeout duration in milliseconds.
 * @returns {Function} A new function that will throw an error if the original function doesn't settle in time.
 */
const withTimeout = (fn, timeoutMs) => {
  return (...args) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
    });

    return Promise.race([
      fn(...args),
      timeoutPromise,
    ]);
  };
};

export default withTimeout;