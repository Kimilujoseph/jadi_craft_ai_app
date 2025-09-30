import ApiError from "./errors/ApiError.js";
//this part can be confusing some but here is an explanation
//text me i will give more details
const withTimeout = (fn, timeoutMs) => {
  return (...args) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new ApiError("Request Timeout", 504)), timeoutMs);
    });

    return Promise.race([
      fn(...args),
      timeoutPromise,
    ]);
  };
};

export default withTimeout;

// /**
//  * Wraps an async function (fn) to automatically reject if it doesn't resolve
//  * within the specified timeout.
//  * * @param {function} fn - The asynchronous function to execute (e.g., an LLM API call).
//  * @param {number} timeoutMs - The timeout limit in milliseconds.
//  * @returns {function} A wrapped function that returns a Promise.
//  */
// const withTimeout = (fn, timeoutMs) => {
//   return (...args) => {
//     // 1. Create a promise that rejects after the timeout period
//     const timeoutPromise = new Promise((_, reject) => {
//       const id = setTimeout(() => {
//         // Clear the timer to prevent resource leaks
//         clearTimeout(id); 
//         // Reject with a standard Error, which the LLMProvider will catch.
//         reject(new Error(`LLM Timeout after ${timeoutMs}ms`));
//       }, timeoutMs);
//     });

//     // 2. Clear the timeout if the original function resolves first
//     const functionPromise = fn(...args).finally(() => clearTimeout(id));

//     // 3. Race the two promises
//     return Promise.race([
//       functionPromise,
//       timeoutPromise,
//     ]);
//   };
// };

// export default withTimeout;