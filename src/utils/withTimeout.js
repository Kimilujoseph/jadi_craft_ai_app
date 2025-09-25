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