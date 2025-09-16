import express from 'express';
import promptOrchestrator from '../promptOrchestrator/index.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply the rate limiter middleware before the main route handler
router.post('/', rateLimiter, async (req, res, next) => {
  const { question, idempotencyKey } = req.body;

  // userId is checked by the rateLimiter, so we only need to check for the other required fields.
  if (!question || !idempotencyKey) {
    return next(new ErrorHandler('`question` and `idempotencyKey` are required.', 400));
  }

  try {
    const response = await promptOrchestrator.handleQuestion(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;