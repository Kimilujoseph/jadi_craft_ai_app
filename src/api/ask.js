import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import promptOrchestrator from '../promptOrchestrator/index.js';
import rateLimiter from '../middleware/rateLimiter.js';
import authMiddleware from '../middleware/auth.js';
import { UsageType } from '@prisma/client';

const router = express.Router();

router.post(
  '/ask',

  authMiddleware,

  rateLimiter(UsageType.CHAT_MESSAGES),


  (req, res, next) => {
    if (req.body.wantsAudio) {

      return rateLimiter(UsageType.AUDIO_GENERATION)(req, res, next);
    }
    next();
  },


  async (req, res, next) => {
    try {
      const { question, wantsAudio = false, chatId = null } = req.body;
      const userId = req.user.id;

      if (!question) {
        return res.status(400).json({ message: 'The question field is required.' });
      }

      const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();
      res.setHeader('x-idempotency-key', idempotencyKey);

      const response = await promptOrchestrator.handleQuestion({
        question,
        wantsAudio,
        userId,
        idempotencyKey,
        chatId,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;