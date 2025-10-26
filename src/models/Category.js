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
  PEOPLE: "PEOPLE",
  PERIOD: "PERIOD",
  BELIEF: "BELIEF",
  MODERN: "MODERN",
  FOOD: "FOOD",
  ARTIFACTS: "ARTIFACTS",
  LANGUAGE: "LANGUAGE",
  CLOTHING: "CLOTHING",
  CUSTOMS: "CUSTOMS", // General fallback
  UNKNOWN: "UNKNOWN", // Should not be used in prompts
  SHOPPING: "SHOPPING",
  GIFTS: "GIFTS",
  HANDMADE: "HANDMADE",
  CRAFTS: "CRAFTS",
  POTTERY: "POTTERY",
  ART: "ART"
};

export default Category;