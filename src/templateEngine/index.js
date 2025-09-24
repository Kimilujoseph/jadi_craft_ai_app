// /**
//  * Builds a refined prompt for the LLM.
//  */
// class TemplateEngine {
//   /**
//    * @param {Category} category The category of the query.
//    * @param {string} query The original user query.
//    * @returns {string} The refined prompt.
//    */
//   buildPrompt(category, query) {
//     // TODO: Implement more sophisticated prompt engineering.
//     console.log(`Building prompt for category "${category}"`);
//     return `In the context of ${category}, answer the following question: ${query}`;
//   }
// }

// const templateEngine = new TemplateEngine();
// export default templateEngine;
import Category from '../models/Category.js';

/**
 * Builds a refined prompt for the LLM based on the query's category.
 */
class TemplateEngine {
  /**
   * @param {Category} category The category of the query.
   * @param {string} query The original user query.
   * @returns {string} The refined prompt.
   */
  buildPrompt(category, query) {
    console.log(`Building prompt for category "${category}"`);

    let promptTemplate = '';

    // Choose a prompt template based on the determined category
    switch (category) {
      case Category.PEOPLE:
        promptTemplate = `Provide a detailed and culturally accurate answer about the people, historical figures, or social structures related to the following query. Please include their significance and role. The question is: "${query}"`;
        break;
      case Category.PERIOD:
        promptTemplate = `Describe the historical period or timeline relevant to the following query. Explain key events, historical context, and the cultural landscape of that era. The question is: "${query}"`;
        break;
      case Category.PRACTICE:
        promptTemplate = `Explain the cultural practices, rituals, or daily life activities relevant to the following query. Detail the steps, tools, and significance of these practices. The question is: "${query}"`;
        break;
      case Category.BELIEF:
        promptTemplate = `Elaborate on the beliefs, mythology, or spiritual concepts related to the following query. Describe their origins, meanings, and influence on the culture. The question is: "${query}"`;
        break;
      case Category.MODERN:
        promptTemplate = `Discuss the modern-day context and evolution of the cultural topic in the following query. How has it changed over time, and what is its relevance today? The question is: "${query}"`;
        break;
      default:
        // A generic template for uncategorized or default queries
        promptTemplate = `Provide a well-structured and culturally sensitive answer to the following question: "${query}"`;
        break;
    }

    return promptTemplate;
  }
}

const templateEngine = new TemplateEngine();
export default templateEngine;