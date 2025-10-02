// testLLM.js
import llmProvider from "./index.js"; // import the provider class from index.js

async function runTest() {
  try {
    const result = await llmProvider.generateText("Hello AI, are you working?");
    console.log("✅ Response:", result.text);
    console.log("⚡ Used Fallback:", result.fallbackUsed);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Run the test
runTest();
