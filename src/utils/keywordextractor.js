
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
  'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this',
  'that', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'a', 'an', 'the', 'and',
  'but', 'if', 'or', 'as', 'of', 'at', 'by', 'for', 'with', 'to', 'from', 'in', 'out',
  'on', 'can', 'will', 'just', 'want', 'find', 'get', 'buy', 'looking', 'near', 'where', 'how'
]);

/**
 * Extracts meaningful keywords from a user query.
 * @param {string} query - The user's raw question.
 * @returns {string[]} An array of unique keywords.
 */
export const extractKeywords = (query) => {
  if (!query) return [];
  
  // Normalize: lowercase, remove punctuation
  const normalizedQuery = query.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split into words, filter out stop words and short words
  const keywords = normalizedQuery
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
    
  return [...new Set(keywords)]; // Return unique keywords
};