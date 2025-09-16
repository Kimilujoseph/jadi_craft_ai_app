import prisma from '../database/client.js';
import ErrorHandler from '../utils/ErrorHandler.js';

const DAILY_REQUEST_LIMIT = 100;

const rateLimiter = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {

    return next(new ErrorHandler('User ID is required for rate limiting.', 400));
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const requestCount = await prisma.qUESTIONS.count({
      where: {
        user_id: userId,
        created_at: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (requestCount >= DAILY_REQUEST_LIMIT) {
      return next(new ErrorHandler('You have exceeded the daily request limit.', 429));
    }

    next();

  } catch (error) {
    next(error);
  }
};

export default rateLimiter;