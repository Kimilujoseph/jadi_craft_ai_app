import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import EventsController from './events.contoller.js';
import authenticate from '../../middleware/auth.js';

const router = express.Router();

// Multer setup for event image uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'events');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${name}${ext}`);
    },
});
const upload = multer({ storage });

/**
 * Routes:
 * GET     /api/events         -> get all events
 * GET     /api/events/:id     -> get single event
 * POST    /api/events         -> create event (auth + optional image upload)
 * PUT     /api/events/:id     -> update event (auth + optional image upload)
 * DELETE  /api/events/:id     -> delete event (auth)
 */

// Public: list events
router.get('/', (req, res, next) => EventsController.getEvents(req, res, next));

// Public: get event by id
router.get('/:id', (req, res, next) => EventsController.getEventById(req, res, next));

// Protected: create event (accepts multipart/form-data with field "image")
router.post('/', authenticate, upload.single('image'), (req, res, next) =>
    EventsController.createEvent(req, res, next)
);

// Protected: update event (accepts multipart/form-data with field "image")
// note: publish flag may be toggled here; controller authorizes owner or admin
router.put('/:id', authenticate, upload.single('image'), (req, res, next) =>
    EventsController.updateEvent(req, res, next)
);

// Protected: delete event
router.delete('/:id', authenticate, (req, res, next) =>
    EventsController.deleteEvent(req, res, next)
);

export default router;