import prisma from '../database/client.js';
import AuthenticationError from '../utils/errors/AuthenticationError.js';
import RateLimitError from '../utils/errors/RateLimitError.js';
import { UsageType } from '@prisma/client'; // Import the enum from the generated Prisma client

// --- Configuration for usage limits ---
// In a real app, this would likely live in a separate config file.
const USAGE_LIMITS = {
  FREE: {
    [UsageType.AUDIO_GENERATION]: 10,
    [UsageType.CHAT_MESSAGES]: 100,
  },
  PAID: {
    [UsageType.AUDIO_GENERATION]: 500,
    [UsageType.CHAT_MESSAGES]: 2000,
  },
};

const USAGE_CYCLE_DAYS = 30;


const rateLimiter = (usageType) => {
  return async (req, res, next) => {
    try {
      console.log(req.user)
      if (!req.user) {
        //next()
        throw new AuthenticationError('Authentication is required to access this feature.');
      }

      const found_user = req.user;
      const user_id = found_user.user_id


      const user = await prisma.User.findUnique({ where: { user_id: user_id } });
      console.log("user@#@#@", user)
      if (!user) {
        throw new AuthenticationError('Authentication is required to accces this feature')
      }

      const plan = user.plan;
      const limit = USAGE_LIMITS[plan]?.[usageType];

      if (limit === undefined) {

        return next();
      }

      const now = new Date();

      const cycleStartDate = new Date(now);
      cycleStartDate.setDate(now.getDate() - USAGE_CYCLE_DAYS);
      const currentUsage = await prisma.usageTracker.findUnique({

        where: {
          userId_usageType: {
            userId: BigInt(user_id),    // must match field name in model
            usageType: usageType
          }
        }
      });

      if (currentUsage && currentUsage.cycleStartDate > cycleStartDate) {

        if (currentUsage.count >= limit) {
          throw new RateLimitError(`Usage limit of ${limit} for ${usageType} exceeded for the current cycle.`);
        }
        // Increment the count
        await prisma.usageTracker.update({
          where: { id: currentUsage.id },
          data: { count: { increment: 1 } },
        });
      } else {
        await prisma.usageTracker.upsert({
          where: {
            userId_usageType: {
              userId: BigInt(user_id),
              usageType
            }
          },
          create: {
            userId: BigInt(user_id),
            usageType,
            count: 1,
            cycleStartDate: now,
          },
          update: {
            count: 1,
            cycleStartDate: now,
          },
        });

      }
      return next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      return next(error);
    }
  };
};

export default rateLimiter;
