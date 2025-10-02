import Category from "../models/Category.js";
import fetch from "node-fetch"; // Assumes a Node.js environment

/**
 * Classifies a user's query into a predefined category using Gemini API.
 */
class Categorizer {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    // Gemini endpoint (note: API key goes in query param, not headers)
    this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    this.modelName = "gemini-2.0-flash";
  }

  /**
   * @param {string} query The user's question.
   * @returns {Promise<Category>} The determined category.
   */
    async categorize(query) {
    console.log(`Categorizing query with LLM (Gemini): "${query}"`);

    // ✅ Prevent bad input
    if (!query || query === "undefined") {
      console.warn("Received invalid query, falling back to default category.");
      return this.defaultCategory || Category.PRACTICE;
    }

    const categories = Object.values(Category).join(", ");

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
                  text: `Classify the following query into one of these categories: ${categories}.
Return only the category name, nothing else.

Query: ${query}`
                }
              ]
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gemini API call failed with status: ${response.status}, body: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Gemini raw response:", JSON.stringify(data, null, 2));

      let llmCategory = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // ✅ Normalize Gemini output
      if (llmCategory === "UNKNOWN") {
        console.warn("Gemini returned UNKNOWN, falling back to default.");
        return this.defaultCategory || Category.PRACTICE;
      }

      // ✅ Validate against known categories
      if (llmCategory && Object.values(Category).includes(llmCategory)) {
        console.log(`Query "${query}" categorized as ${llmCategory}`);
        return llmCategory;
      } else {
        console.warn(
          `LLM returned invalid category: ${llmCategory}. Falling back to default.`
        );
        return this.defaultCategory || Category.PRACTICE;
      }
    } catch (error) {
      console.error("Error during Gemini categorization:", error);
      return this.defaultCategory || Category.PRACTICE;
    }
  }

}

const categorizer = new Categorizer();
export default categorizer;


// import Category from "../models/Category.js";
// import fetch from "node-fetch"; // Assumes a Node.js environment

// /**
//  * Classifies a user's query into a predefined category using an LLM API.
//  * This class requires an API key for a lightweight LLM provider (e.g., OpenAI, Anthropic).
//  */
// class Categorizer {
//   constructor() {
//     // It's best practice to load the API k ey from a secure environment variable
//     this.apiKey = process.env.GEMINI_API_KEY; 
//     if (!this.apiKey) {
//       throw new Error("LLM_API_KEY environment variable is not set.");
//     }
//     // API endpoint for your chosen LLM (e.g., OpenAI)
//     // this.apiEndpoint = "https://api.openai.com/v1/chat/completions"; 
//     // this.modelName = "gpt-4o-mini";

//     this.apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
//     this.modelName = "gemini-2.0-flash";

//     // this.apiEndpoint = "https://api.cohere.ai/v1/classify";
//     // this.modelName = "cohere-classify"; // 👈 just a placeholder, since classify doesn’t take a model param

//     // this.apiEndpoint = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf";
//     // this.modelName = "meta-llama/Llama-2-7b-chat-hf";
//   }

//   /**
//    * @param {string} query The user's question.
//    * @returns {Promise<Category>} The determined category.
//    */
//   async categorize(query) {
//     console.log(`Categorizing query with LLM: "${query}"`);

//     const categories = Object.values(Category).join(", ");

//     try {
//       const response = await fetch(this.apiEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${this.apiKey}`,
//         },
//         body: JSON.stringify({
//           model: this.modelName,
//           messages: [
//             {
//               role: "system",
//               content: `You are an intent classifier. Your task is to analyze a user's query and classify it into one of the following categories: ${categories}. Return only the category name from the list. Do not provide any additional text or explanation.`,
//             },
//             {
//               role: "user",
//               content: query,
//             },
//           ],
//           response_format: { type: "json_object" },
//           temperature: 0, // Set temperature to 0 for consistent, predictable output
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`API call failed with status: ${response.status}`);
//       }

//       const data = await response.json();
//       const llmCategory = data.choices[0].message.content;

//       // Validate the LLM's response against our predefined categories
//       if (Object.values(Category).includes(llmCategory)) {
//         console.log(`Query "${query}" categorized as ${llmCategory}`);
//         return llmCategory;
//       } else {
//         console.warn(`LLM returned an invalid category: ${llmCategory}. Falling back to default.`);
//         return Category.PRACTICE; // Fallback to a default category
//       }

//     } catch (error) {
//       console.error("Error during LLM categorization:", error);
//       return Category.PRACTICE; // Fallback in case of API or network error
//     }
//   }
// }

// const categorizer = new Categorizer();
// export default categorizer;

