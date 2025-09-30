✦ All modules have been updated. The application now has a consistent and robust error handling pipeline.

  As requested, here is a detailed explanation of how an error is now handled, from the moment it occurs in a service to the final
  response the user receives.

  The Lifecycle of an Error: A Step-by-Step Walkthrough

  Let's imagine a user asks a question, but the primary LLM service is down and its API returns a 503 Service Unavailable error.

  Step 1: Origin and Classification (in `llmProvider`)
   1. The axios.post call inside the callPrimary method fails. It receives the 503 response from the remote server.
   2. The catch block inside callPrimary is immediately triggered.
   3. Instead of letting the raw AxiosError escape, it constructs a new, specific error: throw new LLMError('Primary LLM provider failed: 
      API responded with status 503').
   4. This custom LLMError is now thrown.

  Step 2: Fallback Attempt (in `llmProvider`)
   1. The catch block in the tryWithAfallBack method receives the LLMError from callPrimary.
   2. It recognizes the primary call failed and proceeds to call the fallback function, callFallback.
   3. Let's assume the fallback service is also down. The exact same process happens: axios fails, and callFallback throws its own new 
      LLMError(...).
   4. The second catch block in tryWithAfallBack now catches this second failure and throws the final, summary error: throw new 
      LLMError('Both primary and fallback AI services are unavailable.').

  Step 3: Orchestrator's Catch (in `PromptOrchestrator`)
   1. The llmProvider.generateText(refinedPrompt) call in handleQuestion fails because the LLMError from the previous step was thrown out
      of it.
   2. The main try...catch block in handleQuestion catches this specific LLMError. The error variable is now an instance of your custom
      LLMError class.

  Step 4: Internal Analysis (in `PromptOrchestrator`)
   1. The first thing the catch block does is call await this._logFailure(error, userMessage.id).
   2. The _logFailure helper method inspects the error. It sees that error instanceof LLMError is true.
   3. It sets the failureType to 'LLM_PRIMARY'.
   4. It then runs prisma.failureLog.create(), saving a structured record to your database. You now have a permanent, analyzable log of
      this specific failure, linked to the exact user message that caused it.

  Step 5: Passing the Baton (in `PromptOrchestrator`)
   1. After the failure is successfully logged, the catch block executes its final line: throw error;.
   2. It re-throws the original LLMError object. This is crucial. The orchestrator's job is to log the internal failure, not to decide
      what the user sees. It passes the error up the chain.

  Step 6: Final Client Response (in `errorHandler.js`)
   1. Because the error was re-thrown, the Express framework catches it and passes it to your global errorHandler middleware.
   2. The middleware checks if (error instanceof BaseError). This is true, because LLMError extends BaseError.
   3. It then uses the properties of your custom error to create the final response. It sends a JSON response with the error.statusCode
      (which you can define on your custom errors, e.g., 503) and the clean error.message.

  The end-user sees a clean, safe message like {"message": "Both primary and fallback AI services are unavailable."}, while you have a
  rich, detailed log in your database for debugging and analysis.

  This completes the full, robust implementation of your application's core logic and error handling.
