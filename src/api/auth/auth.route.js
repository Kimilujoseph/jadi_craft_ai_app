
import express from 'express';
import * as authController from './auth.controller.js';
import { signupValidation, signinValidation, handleValidationErrors } from '../../middleware/validators.js';

const router = express.Router();

router.post('/signup', signupValidation, handleValidationErrors, authController.signup);

router.post('/signin', signinValidation, handleValidationErrors, authController.signin);

export default router;
