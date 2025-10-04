
import express from 'express';
import * as authController from './auth.controller.js';
import { signupValidation, signinValidation, handleValidationErrors } from '../../middleware/validators.js';
import * as askController from '../ask/ask.controller.js';
import rateLimiter from '../../middleware/rateLimiter.js';
import authMiddleware from '../../middleware/auth.js';
import { UsageType } from '@prisma/client';


const router = express.Router();

router.post('/signup', signupValidation, handleValidationErrors, authController.signup);

router.post('/signin', signinValidation, handleValidationErrors, authController.signin);
router.post(
    '/question',
    authMiddleware,
    rateLimiter(UsageType.CHAT_MESSAGES),
    // (req, res, next) => {
    //     if (req.body.wantsAudio) {
    //         return rateLimiter(UsageType.AUDIO_GENERATION)(req, res, next);
    //     }
    //     next();
    // },
    askController.handleAsk
);


export default router;
