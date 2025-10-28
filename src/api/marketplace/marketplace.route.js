import express from 'express';
import * as marketplaceController from './marketplace.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { createListingValidator, updateListingValidator } from './marketplace.validator.js';

const router = express.Router();

// @route   POST /api/v1/marketplace/listings
// @desc    Create a new marketplace listing
// @access  Private (VENDORS only)
router.post('/listings', authMiddleware, createListingValidator, marketplaceController.createListing);

// @route   GET /api/v1/marketplace/listings
// @desc    Get all listings for the authenticated user
// @access  Private
router.get('/listings', authMiddleware, marketplaceController.getMyListings);

// @route   PATCH /api/v1/marketplace/listings/:id
// @desc    Update a listing for the authenticated user
// @access  Private
router.patch('/listings/:id', authMiddleware, updateListingValidator, marketplaceController.updateListing);

// @route   DELETE /api/v1/marketplace/listings/:id
// @desc    Delete a listing for the authenticated user
// @access  Private
router.delete('/listings/:id', authMiddleware, marketplaceController.deleteListing);
 
router.post('/click', authMiddleware, marketplaceController.handleMarketplaceClick);
export default router;
