import express from 'express';
import promptOrchestrator from '../promptOrchestrator/index.js';
import BadRequestError from '../utils/errors/BadRequestError.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply the rate limiter middleware before the main route handler
router.post('/', rateLimiter, async (req, res, next) => {
  const { question, idempotencyKey } = req.body;

  // userId is checked by the rateLimiter, so we only need to check for the other required fields.
  if (!question || !idempotencyKey) {
    return next(new BadRequestError('`question` and `idempotencyKey` are required.'));
  }

  try {
    const response = await promptOrchestrator.handleQuestion(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;