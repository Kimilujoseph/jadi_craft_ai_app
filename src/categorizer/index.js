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
    return Category.PRACTICE;
  }
}

const categorizer = new Categorizer();
export default categorizer;