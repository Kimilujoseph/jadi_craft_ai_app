import prisma from '../../database/client.js';
import NotFoundError from '../../utils/errors/NotFoundError.js';

/**
 * @description Get all chats for the authenticated user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */

class EventsController {
    // Get all events, ordered by time desc
    async getEvents(req, res, next) {
        try {
            const userId = req.user?.user_id;
            const where = req.user
                ? {
                      OR: [
                          { published: true },
                          { userId: userId ? BigInt(userId) : undefined },
                      ],
                  }
                : { published: true };

            const events = await prisma.event.findMany({
                where,
                orderBy: { time: 'desc' },
            });

            const serialized = events.map(e => ({
                id: e.id.toString(),
                title: e.title || null,
                image: e.image || null,
                shortDescription: e.shortDescription,
                time: e.time,
                venue: e.venue,
                link: e.link || null,
                published: !!e.published,
                userId: e.userId ? e.userId.toString() : null,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
            }));

            return res.status(200).json(serialized);
        } catch (error) {
            next(error);
        }
    }

    // Get single event by id
    async getEventById(req, res, next) {
        try {
            const id = BigInt(req.params.id);
            const event = await prisma.event.findUnique({
                where: { id },
            });

            if (!event) {
                throw new NotFoundError('Event not found.');
            }

            // If not published, only owner or admin may view
            const requesterId = req.user?.user_id;
            const isOwner = requesterId && event.userId && String(event.userId) === String(requesterId);
            const isAdmin = !!req.user?.is_admin;

            if (!event.published && !(isOwner || isAdmin)) {
                throw new NotFoundError('Event not found.');
            }

            const serialized = {
                id: event.id.toString(),
                title: event.title || null,
                image: event.image || null,
                shortDescription: event.shortDescription,
                time: event.time,
                venue: event.venue,
                link: event.link || null,
                published: !!event.published,
                userId: event.userId ? event.userId.toString() : null,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            };

            return res.status(200).json(serialized);
        } catch (error) {
            if (error instanceof NotFoundError) return next(error);
            next(error);
        }
    }

    // Create a new event
    async createEvent(req, res, next) {
        try {
            const userId = req.user?.user_id;
            const image = req.file ? (req.file.path || req.file.filename) : (req.body.image || null);

            const {
                title = null,
                shortDescription,
                time,
                venue,
                link = null,
            } = req.body;

            if (!shortDescription || !time || !venue) {
                return res.status(400).json({
                    message: 'shortDescription, time and venue are required',
                });
            }

            const data = {
                title,
                image,
                shortDescription,
                time: new Date(time),
                venue,
                link,
                published: false, // create as unpublished until verified
                ...(userId ? { userId: BigInt(userId) } : {}),
            };

            const created = await prisma.event.create({ data });

            const serialized = {
                id: created.id.toString(),
                title: created.title || null,
                image: created.image || null,
                shortDescription: created.shortDescription,
                time: created.time,
                venue: created.venue,
                link: created.link || null,
                published: !!created.published,
                userId: created.userId ? created.userId.toString() : null,
                createdAt: created.createdAt,
                updatedAt: created.updatedAt,
            };

            return res.status(201).json(serialized);
        } catch (error) {
            next(error);
        }
    }

    // Update event by id
    async updateEvent(req, res, next) {
        try {
            const id = BigInt(req.params.id);

            const existing = await prisma.event.findUnique({ where: { id } });
            if (!existing) throw new NotFoundError('Event not found.');

            const requesterId = req.user?.user_id;
            const isOwner = requesterId && existing.userId && String(existing.userId) === String(requesterId);
            const isAdmin = !!req.user?.is_admin;

            // Only owner or admin can modify
            if (!(isOwner || isAdmin)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // If file uploaded, prefer file path/filename
            if (req.file) {
                req.body.image = req.file.path || req.file.filename;
            }

            const updateData = {};
            if (req.body.title !== undefined) updateData.title = req.body.title;
            if (req.body.image !== undefined) updateData.image = req.body.image;
            if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
            if (req.body.time !== undefined) updateData.time = new Date(req.body.time);
            if (req.body.venue !== undefined) updateData.venue = req.body.venue;
            if (req.body.link !== undefined) updateData.link = req.body.link;
            // allow publish toggle only to admin or owner (already enforced)
            if (req.body.published !== undefined) updateData.published = req.body.published === 'true' || req.body.published === true;

            const updated = await prisma.event.update({
                where: { id },
                data: updateData,
            });

            const serialized = {
                id: updated.id.toString(),
                title: updated.title || null,
                image: updated.image || null,
                shortDescription: updated.shortDescription,
                time: updated.time,
                venue: updated.venue,
                link: updated.link || null,
                published: !!updated.published,
                userId: updated.userId ? updated.userId.toString() : null,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            };

            return res.status(200).json(serialized);
        } catch (error) {
            if (error instanceof NotFoundError) return next(error);
            next(error);
        }
    }

    // Delete event by id
    async deleteEvent(req, res, next) {
        try {
            const id = BigInt(req.params.id);

            const existing = await prisma.event.findUnique({ where: { id } });
            if (!existing) throw new NotFoundError('Event not found.');

            const requesterId = req.user?.user_id;
            const isOwner = requesterId && existing.userId && String(existing.userId) === String(requesterId);
            const isAdmin = !!req.user?.is_admin;

            if (!(isOwner || isAdmin)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            await prisma.event.delete({ where: { id } });

            return res.status(200).json({ message: 'Event deleted' });
        } catch (error) {
            if (error instanceof NotFoundError) return next(error);
            next(error);
        }
    }
}

export default new EventsController();