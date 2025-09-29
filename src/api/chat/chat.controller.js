
import prisma from '../../database/client.js';
import NotFoundError from '../../utils/errors/NotFoundError.js';

/**
 * @description Get all chats for the authenticated user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
export const getChats = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const chats = await prisma.chat.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        res.status(200).json(chats);
    } catch (error) {
        next(error);
    }
};

/**
 * @description Get all messages for a specific chat.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
export const getChatMessages = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const chatId = BigInt(req.params.chatId);

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
        });

        if (!chat) {
            throw new NotFoundError('Chat not found.');
        }

        if (chat.userId !== userId) {

            throw new NotFoundError('Chat not found.');
        }

        const messages = await prisma.message.findMany({
            where: {
                chatId: chatId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        res.status(200).json(messages);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return next(error);
        }
        next(new Error("An unexpected error occurred while fetching chat messages."));
    }
};
