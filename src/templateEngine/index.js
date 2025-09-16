/**
 * Builds a refined prompt for the LLM.
 */
class TemplateEngine {
  /**
   * @param {Category} category The category of the query.
   * @param {string} query The original user query.
   * @returns {string} The refined prompt.
   */
  buildPrompt(category, query) {
    // TODO: Implement more sophisticated prompt engineering.
    console.log(`Building prompt for category "${category}"`);
    return `In the context of ${category}, answer the following question: ${query}`;
  }
}

const templateEngine = new TemplateEngine();
export default templateEngine;