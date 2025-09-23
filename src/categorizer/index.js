// import Category from '../models/Category.js';

// /**
//  * Classifies a user's query into a predefined category.
//  */
// class Categorizer {
//   /**
//    * @param {string} query The user's question.
//    * @returns {Promise<Category>} The determined category.
//    */
//   async categorize(query) {

//     console.log(`Categorizing query: "${query}"`);
//     return Category.PRACTICE;
//   }
// }

// const categorizer = new Categorizer();
// export default categorizer;
import Category from '../models/Category.js';

/**
 * Classifies a user's query into a predefined category based on keywords.
 */
class Categorizer {
  /**
   * @param {string} query The user's question.
   * @returns {Promise<Category>} The determined category.
   */
  async categorize(query) {
    console.log(`Categorizing query: "${query}"`);

    const lowerCaseQuery = query.toLowerCase();

    // Keywords for different categories
    if (lowerCaseQuery.includes('who') || lowerCaseQuery.includes('people') || lowerCaseQuery.includes('person')) {
      return Category.PEOPLE;
    }
    if (lowerCaseQuery.includes('when') || lowerCaseQuery.includes('history') || lowerCaseQuery.includes('period') || lowerCaseQuery.includes('era')) {
      return Category.PERIOD;
    }
    if (lowerCaseQuery.includes('how') || lowerCaseQuery.includes('practice') || lowerCaseQuery.includes('ritual') || lowerCaseQuery.includes('ceremony') || lowerCaseQuery.includes('tools')) {
      return Category.PRACTICE;
    }
    if (lowerCaseQuery.includes('why') || lowerCaseQuery.includes('belief') || lowerCaseQuery.includes('mythology') || lowerCaseQuery.includes('gods')) {
      return Category.BELIEF;
    }
    if (lowerCaseQuery.includes('modern') || lowerCaseQuery.includes('today') || lowerCaseQuery.includes('current')) {
      return Category.MODERN;
    }

    // Default or fallback category if no keywords are found
    return Category.PRACTICE;
  }
}

const categorizer = new Categorizer();
export default categorizer;