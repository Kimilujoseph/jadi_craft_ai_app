import Category from "../models/Category.js";

/**
 * Categorizer class
 * Classifies a user's query into a predefined category based on keywords.
 */
class Categorizer {
  /**
   * Constructor allows customizing the fallback category.
   * @param {Category} defaultCategory - Category to use when no keywords match.
   */
  constructor(defaultCategory = Category.PRACTICE) {
    this.defaultCategory = defaultCategory;

    // Centralized keyword mappings (easier to maintain/expand)
    this.keywords = {
      [Category.PEOPLE]: ["who", "people", "person", "leader"],
      [Category.PERIOD]: ["when", "history", "period", "era", "time"],
      [Category.PRACTICE]: ["how", "practice", "ritual", "ceremony", "tools", "tool"],
      [Category.BELIEF]: ["why", "belief", "mythology", "gods", "religion", "spirit"],
      [Category.MODERN]: ["modern", "today", "current"]
    };
  }

  /**
   * Instance method: Categorize a query based on keywords.
   * @param {string} query The user's question.
   * @returns {Promise<Category>} The determined category.
   */
  async categorize(query) {
    console.log(`Categorizing query: "${query}"`);

    const text = query.toLowerCase();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(this.keywords)) {
      if (keywords.some((word) => text.includes(word))) {
        return category;
      }
    }

    // Fallback if no keywords match
    return this.defaultCategory;
  }

  /**
   * Static helper: quickly test if a query matches a given category.
   * @param {string} query
   * @param {Category} category
   * @returns {boolean}
   */
  static matchesCategory(query, category, keywordsMap) {
    const text = query.toLowerCase();
    return (keywordsMap[category] || []).some((word) => text.includes(word));
  }
}

// Export a ready-to-use instance
const categorizer = new Categorizer();
export default categorizer;
