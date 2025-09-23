import Category from '../models/Category.js';

/**
 * Classifies a user's query into a predefined category.
 */
class Categorizer {
  /**
   * @param {string} query The user's question.
   * @returns {Promise<Category>} The determined category.
   */
  async categorize(query) {
    console.log(`Categorizing query: "${query}"`);

    const text = query.toLowerCase();

    if (text.includes("tool") || text.includes("practice") || text.includes("ritual")) {
      return Category.PRACTICE;
    }
    if (text.includes("period") || text.includes("era") || text.includes("time")) {
      return Category.PERIOD;
    }
    if (text.includes("who") || text.includes("person") || text.includes("leader")) {
      return Category.PEOPLE;
    }
    if (text.includes("belief") || text.includes("religion") || text.includes("spirit")) {
      return Category.BELIEF;
    }
    if (text.includes("modern") || text.includes("today") || text.includes("current")) {
      return Category.MODERN;
    }

    // Fallback if no keywords matched
    return Category.PRACTICE;
  }
}

const categorizer = new Categorizer();
export default categorizer;
