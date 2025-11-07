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
router.put('/listings/:id', authMiddleware, updateListingValidator, marketplaceController.updateListing);

// @route   DELETE /api/v1/marketplace/listings/:id
// @desc    Delete a listing for the authenticated user
// @access  Private
router.delete('/listings/:id', authMiddleware, marketplaceController.deleteListing);

// @route   POST /api/v1/marketplace/listings/click
// @desc    Handle a click on a listing
// @access  Private
router.post('/click', authMiddleware, marketplaceController.handleMarketplaceClick);

// @route   POST /api/v1/marketplace/listings/click
// @desc    Handle a click on a listing (alternate path)
// @access  Private
router.post('/listings/click', authMiddleware, marketplaceController.handleMarketplaceClick);

// @route   GET /api/v1/marketplace/listings/:id/analytics
// @desc    Get analytics for a specific listing
// @access  Private (OWNER only)
router.get('/analytics/listings/:id', authMiddleware, marketplaceController.getListingAnalyticsController);

// @route   GET /api/v1/marketplace/analytics/vendor
// @desc    Get vendor analytics summary
// @access  Private
router.get('/analytics/vendor', authMiddleware, marketplaceController.getVendorAnalyticsController);

export default router;
