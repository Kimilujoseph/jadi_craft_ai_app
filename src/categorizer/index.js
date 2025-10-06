// import Category from "../models/Category.js";
// import fetch from "node-fetch"; // Assumes a Node.js environment

// /**
//  * Classifies a user's query into a predefined category using Gemini API.
//  */
// class Categorizer {
//   constructor() {
//     this.apiKey = process.env.GEMINI_API_KEY;
//     if (!this.apiKey) {
//       throw new Error("GEMINI_API_KEY environment variable is not set.");
//     }

//     // Gemini endpoint (note: API key goes in query param, not headers)
//     this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
//     this.modelName = "gemini-2.0-flash";
//   }

//   /**
//    * @param {string} query The user's question.
//    * @returns {Promise<Category>} The determined category.
//    */
//     async categorize(query) {
//     console.log(`Categorizing query with LLM (Gemini): "${query}"`);

//     // ✅ Prevent bad input
//     if (!query || query === "undefined") {
//       console.warn("Received invalid query, falling back to default category.");
//       return this.defaultCategory || Category.PRACTICE;
//     }

//     const categories = Object.values(Category).join(", ");

//     try {
//       const response = await fetch(this.apiEndpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 {
//                   text: `Classify the following query into one of these categories: ${categories}.
// Return only the category name, nothing else.

// Query: ${query}`
//                 }
//               ]
//             }
//           ]
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(
//           `Gemini API call failed with status: ${response.status}, body: ${errorText}`
//         );
//       }

//       const data = await response.json();
//       console.log("Gemini raw response:", JSON.stringify(data, null, 2));

//       let llmCategory = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

//       // ✅ Normalize Gemini output
//       if (llmCategory === "UNKNOWN") {
//         console.warn("Gemini returned UNKNOWN, falling back to default.");
//         return this.defaultCategory || Category.PRACTICE;
//       }

//       // ✅ Validate against known categories
//       if (llmCategory && Object.values(Category).includes(llmCategory)) {
//         console.log(`Query "${query}" categorized as ${llmCategory}`);
//         return llmCategory;
//       } else {
//         console.warn(
//           `LLM returned invalid category: ${llmCategory}. Falling back to default.`
//         );
//         return this.defaultCategory || Category.PRACTICE;
//       }
//     } catch (error) {
//       console.error("Error during Gemini categorization:", error);
//       return this.defaultCategory || Category.PRACTICE;
//     }
//   }

// }

// const categorizer = new Categorizer();
// export default categorizer;

import Category from "../models/Category.js";
import fetch from "node-fetch"; // Assumes a Node.js environment

/**
 * Classifies a user's query into a predefined category using the Gemini API.
 */
class Categorizer {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    // Gemini endpoint (API key goes in query param)
    this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    this.modelName = "gemini-2.0-flash";
    
    // Set a consistent fallback category
    this.defaultCategory = Category.CUSTOMS; 
  }

  /**
   * @param {string} query The user's question.
   * @returns {Promise<Category>} The determined category.
   */
  async categorize(query) {
    console.log(`Categorizing query with LLM (Gemini): "${query}"`);

    // Handle empty or invalid query upfront
    if (!query || query === "undefined" || query.trim().length === 0) {
      console.warn("Received invalid query, falling back to default category.");
      return this.defaultCategory;
    }

    // List all desired categories, excluding internal fallbacks like UNKNOWN
    const categories = [
      Category.PEOPLE,
      Category.PERIOD,
      Category.BELIEF,
      Category.MODERN,
      Category.FOOD,
      Category.ARTIFACTS,
      Category.LANGUAGE,
      Category.CLOTHING,
      Category.CUSTOMS // Include general practices if query is too broad
    ].join(", ");

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are an expert cultural query classifier. Analyze the user's question and classify it into the single most relevant category from this list: ${categories}.
**Return only the category name in ALL CAPS, nothing else.** If the query doesn't fit a specific category, use ${this.defaultCategory}.
Query: ${query}`
                }
              ]
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed with status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      
      // Safely extract and trim the LLM's response
      let llmCategory = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();

      // Check if the LLM's output is one of our valid category keys
      if (llmCategory && Object.values(Category).includes(llmCategory)) {
        console.log(`Query categorized as ${llmCategory}`);
        return llmCategory;
      } else {
        console.warn(`LLM returned invalid or unexpected category: ${llmCategory}. Falling back to default: ${this.defaultCategory}.`);
        return this.defaultCategory; 
      }
    } catch (error) {
      console.error("Error during Gemini categorization (API/Network/Parse error):", error);
      // Fail safely to the default category to allow the Orchestrator/Template Engine to continue
      return this.defaultCategory;
    }
  }
}

const categorizer = new Categorizer();
export default categorizer;