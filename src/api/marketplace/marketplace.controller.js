import prisma from '../../database/client.js';
import AuthorizationError from '../../utils/errors/AuthorizationError.js';

export const createListing = async (req, res, next) => {
  try {
    // Authorization: Ensure the user has the VENDOR role.
    if (req.user.role !== 'VENDOR') {
      throw new AuthorizationError('Forbidden: Only users with the VENDOR role can create listings.');
    }

    const { url, title, description, categories, keywords } = req.body;
    const userId = req.user.user_id;

    const newListing = await prisma.marketplaceListing.create({
      data: {
        url,
        title,
        description,
        categories, // Stored as JSON
        keywords: keywords || [], // Stored as JSON, default to empty array
        userId,
        status: 'ACTIVE', // TODO: Revert to PENDING once payment flow is live
        // expiresAt will be handled by the payment/subscription background job later
      },
    });

    res.status(201).json(newListing);
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

    res.status(200).json(listings);
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

    res.status(200).json(updatedListing);
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
};
