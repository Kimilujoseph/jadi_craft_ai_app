import { body, validationResult } from 'express-validator';
import ValidationError from '../../utils/errors/ValidationError.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract the error messages
    const extractedErrors = errors.array().map(err => ({ [err.path]: err.msg }));
    // Pass to the error handler
    return next(new ValidationError(extractedErrors));
  }
  next();
};

export const createListingValidator = [
  body('url')
    .isURL()
    .withMessage('A valid URL is required for the listing.'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('A title is required for the listing.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('A description is required for the listing.'),
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required.')
    .custom(value => {
      if (!value.every(item => typeof item === 'string')) {
        throw new Error('All categories must be strings.');
      }
      return true;
    }),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array of strings.')
    .custom(value => {
        if (!value.every(item => typeof item === 'string')) {
          throw new Error('All keywords must be strings.');
        }
        return true;
      }),
  handleValidationErrors,
];

export const updateListingValidator = [
  body('url')
    .optional()
    .isURL()
    .withMessage('A valid URL is required for the listing.'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('A title is required for the listing.'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('A description is required for the listing.'),
  body('categories')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one category is required.')
    .custom(value => {
      if (!value.every(item => typeof item === 'string')) {
        throw new Error('All categories must be strings.');
      }
      return true;
    }),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array of strings.')
    .custom(value => {
        if (!value.every(item => typeof item === 'string')) {
          throw new Error('All keywords must be strings.');
        }
        return true;
      }),
  handleValidationErrors,
];
