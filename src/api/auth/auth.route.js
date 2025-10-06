
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



export default router;
