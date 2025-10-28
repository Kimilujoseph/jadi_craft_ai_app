import prisma from '../../database/client.js';
import AuthorizationError from '../../utils/errors/AuthorizationError.js';
import { logClick } from './promotedlistings.js';

export const createListing = async (req, res, next) => {
  try {
    // Authorization: Ensure the user has the VENDOR role.
    if (req.user.role !== 'VENDOR') {
      throw new AuthorizationError('Forbidden: Only User with the VENDOR role can create listings.');
    }

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
}
