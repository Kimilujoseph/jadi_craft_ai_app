
import express from 'express';
import promptOrchestrator from '../promptOrchestrator/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// This route is the main entry point for user questions.
// It uses the prompt orchestrator to handle the full logic.
router.post('/ask', async (req, res, next) => {
  const { question, wantsAudio = false, userId = 'anonymous' } = req.body;

  if (!question) {
    return res.status(400).json({ message: 'The question field is required.' });
  }

  // Idempotency key to prevent duplicate processing on retries
  const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();
  res.setHeader('x-idempotency-key', idempotencyKey);

  try {
    const response = await promptOrchestrator.handleQuestion({
      question,
      wantsAudio,
      userId,
      idempotencyKey,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error); // Forward errors to the global error handler
  }
});

export default router;
