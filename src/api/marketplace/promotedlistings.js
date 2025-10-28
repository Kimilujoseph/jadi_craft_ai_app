
import prisma from '../../database/client.js';

/**
 * Finds the most relevant promoted listings based on AI-powered categories
 * and keyword refinement.
 *
 * @param {string[]} categories - An array of categories from the categorizer (e.g., ['shopping', 'art'])
 * @param {string[]} keywords - An array of keywords extracted from the user query (e.g., ['maasai', 'beadwork'])
 * @param {number} limit - The max number of links to return.
 * @returns {Promise<MarketplaceListing[]>} A list of the highest-scoring listings.
 */
export const findPromotedListings = async (categories = [], keywords = [], limit = 2) => {
  if (categories.length === 0) {
    return [];
  }

  // Layer 1: Broad Match (AI Categories)
  const potentialListings = await prisma.marketplaceListing.findMany({
    where: {
      status: 'ACTIVE',
      OR: categories.map(cat => ({
        categories: {
          path: '$', 
          array_contains: cat.toLowerCase()
        }
      }))
    }
  });

  // Layer 2: Fine-Tuning (Keyword Scoring)
  const scoredListings = potentialListings.map(listing => {
    let score = 0;
    const listingKeywords = listing.keywords || [];
    const listingCategories = listing.categories || [];

    // Add score for each matching category
    for (const cat of categories) {
      if (listingCategories.includes(cat.toLowerCase())) {
        score += 1; // Base score for category match
      }
    }

    // Add a higher score for each matching keyword
    for (const kw of keywords) {
      if (listingKeywords.includes(kw.toLowerCase())) {
        score += 2; // Higher weight for specific keywords
      }
    }
    
    return { ...listing, score };
  });

  // Sort by score (highest first) and take the top 'limit'
  const rankedListings = scoredListings
    .filter(l => l.score > 0)
    .sort((a, b) => b.score - a.score);

  return rankedListings.slice(0, limit);
};

/**
 * Logs an "impression" for an SEO analytic.
 * Called every time a promoted link is SHOWN to a user.
 */
export const logImpression = async (listingId, userId, userQuery) => {
  try {
    await prisma.marketplaceImpression.create({
      data: {
        listingId: listingId,
        userId: userId, // Can be null if user is not logged in
        userQuery: userQuery,
      },
    });
  } catch (error) {
    // Fail silently. Analytics logging should not break the user experience.
    console.error('Error logging marketplace impression:', error);
  }
};

/**
 * Logs a "click" for an SEO analytic.
 * Called via an API endpoint when the user CLICKS a link.
 */
export const logClick = async (listingId, userId) => {
  try {
    return await prisma.marketplaceClick.create({
      data: {
        listingId: listingId,
        userId: userId, // Will come from auth middleware
      },
    });
  } catch (error) {
    console.error('Error logging marketplace click:', error);
    throw new Error('Could not log click.');
  }
};