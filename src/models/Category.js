// /**
//  * @enum {string}
//  * Defines the categories for user queries.
//  */
// const Category = {
//   PEOPLE: 'PEOPLE',
//   PERIOD: 'PERIOD',
//   PRACTICE: 'PRACTICE',
//   BELIEF: 'BELIEF',
//   MODERN: 'MODERN',
//   UNKNOWN: 'UNKNOWN',
// };

// export default Category;
/**
 * @enum {string}
 * Defines the comprehensive categories for cultural queries.
 */
const Category = {
  // Original Categories
  PEOPLE: 'PEOPLE',       // Queries about individuals, groups, or social structure
  PERIOD: 'PERIOD',       // Queries about historical timeframes or eras
  BELIEF: 'BELIEF',       // Queries about spiritual concepts, mythology, or religion
  MODERN: 'MODERN',       // Queries about contemporary culture or recent changes
  
  // New Granular Categories for Cultural Practices
  FOOD: 'FOOD',           // Queries about cuisine, recipes, ingredients, and eating habits
  ARTIFACTS: 'ARTIFACTS', // Queries about tools, crafts, ceremonial objects, and architecture
  LANGUAGE: 'LANGUAGE',   // Queries about language, greetings, phrases, and communication
  CLOTHING: 'CLOTHING',   // Queries about dressing, traditional attire, and fashion
  
  // Fallback Categories
  UNKNOWN: 'UNKNOWN',
  CUSTOMS: 'CUSTOMS',     // General practices/rituals (can replace old 'PRACTICE')
};

export default Category;