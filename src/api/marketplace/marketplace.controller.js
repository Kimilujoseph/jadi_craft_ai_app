import prisma from '../../database/client.js';
import AuthorizationError from '../../utils/errors/AuthorizationError.js';
import { logClick, getListingAnalytics, getVendorAnalytics } from './promotedlistings.js';

export const createListing = async (req, res, next) => {
  try {
    // Authorization: Ensure the user has the VENDOR role.
    // if (req.user.role !== 'VENDOR') {
    //   throw new AuthorizationError('Forbidden: Only User with the VENDOR role can create listings.');
    // }

    const { url, title, description, categories, keywords } = req.body;
    const userId = req.user.user_id;

    const newListing = await prisma.marketplaceListing.create({
      data: {
        url,
        title,
        description,
        categories,
        keywords: keywords || [],
        userId,
        status: 'ACTIVE',
      },
    });


    res.status(201).json({ "message": "successfully created a listing" });
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const listings = await prisma.marketplaceListing.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    let newList = listings.map(listing => {
      return {
        id: listing.id,
        url: listing.url,
        title: listing.title,
        description: listing.description,
        categories: listing.categories,
        keywords: listing.keywords,
        status: listing.status,
        userId: listing.userId.toString(),
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      }
    })
    res.status(200).json(newList);
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const updateData = req.body;

    // 1. First, find the listing to get the owner's ID
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // 2. Authorization: Check if the authenticated user is the owner
    if (listing.userId !== userId) {
      throw new AuthorizationError('Forbidden: You can only update your own listings.');
    }

    // 3. If authorized, perform the update
    const updatedListing = await prisma.marketplaceListing.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ "message": "successfully updated the listing" });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    // 1. First, find the listing to get the owner's ID
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // 2. Authorization: Check if the authenticated user is the owner
    if (listing.userId !== userId) {
      throw new AuthorizationError('Forbidden: You can only delete your own listings.');
    }

    // 3. If authorized, perform the deletion
    await prisma.marketplaceListing.delete({
      where: { id },
    });

    res.status(204).send(); // 204 No Content is standard for successful deletion
  } catch (error) {
    next(error);
  }
}

export const handleMarketplaceClick = async (req, res, next) => {
  const { listingId } = req.body;
  const userId = req.user?.user_id; // Comes from authMiddleware

  if (!listingId) {
    return res.status(400).json({ error: 'listingId is required.' });
  }

  try {
    // Call the new service function
    await logClick(listingId, userId);
    res.status(200).json({ success: true, message: 'Click logged.' });
  } catch (error) {
    next(error);
  }
};

// Helper to recursively convert BigInt values to strings in objects/arrays
function convertBigInts(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigInts);
  } else if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'bigint') {
        result[key] = value.toString();
      } else if (Array.isArray(value) || (value && typeof value === 'object')) {
        result[key] = convertBigInts(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}

// NEW: Get analytics for a single listing 
export const getListingAnalyticsController = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.user_id;

    const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.userId !== userId && req.user.role !== 'ADMIN') {
      throw new AuthorizationError('Forbidden: You can only view analytics for your own listings.');
    }

    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;
    if (start && isNaN(start.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
    if (end && isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Invalid end date.' });

    const data = await getListingAnalytics(listingId, { startDate: start, endDate: end });
    return res.status(200).json({ success: true, data: convertBigInts(data) });
  } catch (error) {
    next(error);
  }
};

// NEW: Get vendor-level analytics (authenticated vendor)
export const getVendorAnalyticsController = async (req, res, next) => {
  try {
    const vendorId = req.user.user_id;
    if (!vendorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (start && isNaN(start.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
    if (end && isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Invalid end date.' });

    const data = await getVendorAnalytics(vendorId, { startDate: start, endDate: end, limit });
    return res.status(200).json({ success: true, data: convertBigInts(data) });
  } catch (error) {
    next(error);
  }
};
