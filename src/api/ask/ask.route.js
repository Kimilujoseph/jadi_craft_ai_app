import express from 'express';
import * as askController from './ask.controller.js';
import rateLimiter from '../../middleware/rateLimiter.js';
import authMiddleware from '../../middleware/auth.js';
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
  askController.handleAsk
);

export default router;