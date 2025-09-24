// import Category from "../models/Category.js";

// /**
//  * Categorizer class
//  * Classifies a user's query into a predefined category based on keywords.
//  */
// class Categorizer {
//   /**
//    * Constructor allows customizing the fallback category.
//    * @param {Category} defaultCategory - Category to use when no keywords match.
//    */
//   constructor(defaultCategory = Category.PRACTICE) {
//     this.defaultCategory = defaultCategory;

//     // Centralized keyword mappings (easier to maintain/expand)
//     this.keywords = {
//       [Category.PEOPLE]: ["who", "people", "person", "leader"],
//       [Category.PERIOD]: ["when", "history", "period", "era", "time"],
//       [Category.PRACTICE]: ["how", "practice", "ritual", "ceremony", "tools", "tool"],
//       [Category.BELIEF]: ["why", "belief", "mythology", "gods", "religion", "spirit"],
//       [Category.MODERN]: ["modern", "today", "current"]
//     };
//   }

//   /**
//    * Instance method: Categorize a query based on keywords.
//    * @param {string} query The user's question.
//    * @returns {Promise<Category>} The determined category.
//    */
//   async categorize(query) {
//     console.log(`Categorizing query: "${query}"`);

//     const text = query.toLowerCase();

//     // Check each category's keywords
//     for (const [category, keywords] of Object.entries(this.keywords)) {
//       if (keywords.some((word) => text.includes(word))) {
//         return category;
//       }
//     }

//     // Fallback if no keywords match
//     return this.defaultCategory;
//   }

//   /**
//    * Static helper: quickly test if a query matches a given category.
//    * @param {string} query
//    * @param {Category} category
//    * @returns {boolean}
//    */
//   static matchesCategory(query, category, keywordsMap) {
//     const text = query.toLowerCase();
//     return (keywordsMap[category] || []).some((word) => text.includes(word));
//   }
// }

// // Export a ready-to-use instance
// const categorizer = new Categorizer();
// export default categorizer;

import Category from "../models/Category.js";
import fetch from "node-fetch"; // Assumes a Node.js environment

/**
 * Classifies a user's query into a predefined category using an LLM API.
 * This class requires an API key for a lightweight LLM provider (e.g., OpenAI, Anthropic).
 */
class Categorizer {
  constructor() {
    // It's best practice to load the API key from a secure environment variable
    this.apiKey = process.env.LLM_API_KEY; 
    if (!this.apiKey) {
      throw new Error("LLM_API_KEY environment variable is not set.");
    }
    // API endpoint for your chosen LLM (e.g., OpenAI)
    // this.apiEndpoint = "https://api.openai.com/v1/chat/completions"; 
    // this.modelName = "gpt-4o-mini";

    this.apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    this.modelName = "gemini-2.0-flash";

    // this.apiEndpoint = "https://api.cohere.ai/v1/classify";
    // this.modelName = "cohere-classify"; // 👈 just a placeholder, since classify doesn’t take a model param

    // this.apiEndpoint = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf";
    // this.modelName = "meta-llama/Llama-2-7b-chat-hf";
  }

  /**
   * @param {string} query The user's question.
   * @returns {Promise<Category>} The determined category.
   */
  async categorize(query) {
    console.log(`Categorizing query with LLM: "${query}"`);

    const categories = Object.values(Category).join(", ");

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: "system",
              content: `You are an intent classifier. Your task is to analyze a user's query and classify it into one of the following categories: ${categories}. Return only the category name from the list. Do not provide any additional text or explanation.`,
            },
            {
              role: "user",
              content: query,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0, // Set temperature to 0 for consistent, predictable output
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const llmCategory = data.choices[0].message.content;

      // Validate the LLM's response against our predefined categories
      if (Object.values(Category).includes(llmCategory)) {
        console.log(`Query "${query}" categorized as ${llmCategory}`);
        return llmCategory;
      } else {
        console.warn(`LLM returned an invalid category: ${llmCategory}. Falling back to default.`);
        return Category.PRACTICE; // Fallback to a default category
      }

    } catch (error) {
      console.error("Error during LLM categorization:", error);
      return Category.PRACTICE; // Fallback in case of API or network error
    }
  }
}

const categorizer = new Categorizer();
export default categorizer;