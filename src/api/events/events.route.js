import express from 'express';
import multer from 'multer';
import EventsController from './events.contoller.js';
import authenticate from '../../middleware/auth.js';
import uploadImageToCloudinary from '../../utils/Cloudinary.js';

const router = express.Router();

// 1. Configure Multer to use memory storage.
// This keeps the file buffer in memory (req.file.buffer) instead of saving it locally,
// which is required for streaming to Cloudinary.
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 2. New Middleware: Handles Cloudinary upload.
 * It runs after Multer has processed the file into memory.
 * It replaces the local file data in req.file with the final Cloudinary URL in req.body.image.
 */
const uploadToCloudinary = async (req, res, next) => {
    try {
        if (req.file) {
            // Upload the file buffer to Cloudinary in the 'events' folder
            const imageUrl = await uploadImageToCloudinary(
                req.file.buffer,
                'events'
            );

            // Replace req.body.image with the secure URL (used by the controller)
            req.body.image = imageUrl;

            // Clean up the Multer file object as it's no longer needed
            delete req.file;
        }
        next();
    } catch (error) {
        // If upload fails, pass the error to Express error handler
        console.error('Cloudinary Upload Middleware Failed:', error);
        next(error);
    }
};

/**
 * Routes:
 * GET     /api/events         -> get all events
 * GET     /api/events/:id     -> get single event
 * POST    /api/events         -> create event (auth + optional image upload)
 * PUT     /api/events/:id     -> update event (auth + optional image upload)
 * DELETE  /api/events/:id     -> delete event (auth)
 */

// Public: list events
router.get('/', (req, res, next) => EventsController.getEvents(req, res, next));

// Public: get event by id
router.get('/:id', (req, res, next) => EventsController.getEventById(req, res, next));

// Create event with image upload
router.post(
    '/',
    upload.single('image'), // Multer runs first
    uploadToCloudinary,     // Cloudinary upload runs second
    (req, res, next) => EventsController.createEvent(req, res, next) // Controller runs last
);

// Update event with image upload
router.put(
    '/:id',
    upload.single('image'), // Multer runs first
    uploadToCloudinary,     // Cloudinary upload runs second
    (req, res, next) => EventsController.updateEvent(req, res, next) // Controller runs last
);

// Delete event
router.delete('/:id', (req, res, next) =>
    EventsController.deleteEvent(req, res, next)
);

export default router;