import { body, validationResult } from 'express-validator';
import ValidationError from '../utils/errors/ValidationError.js';

// Middleware to handle the result of the validations
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    throw new ValidationError(errors.array());
  }
  next();
};

// Validation chain for the signup route
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
];

// Validation chain for the signin route
const signinValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

export {
  handleValidationErrors,
  signupValidation,
  signinValidation,
};
