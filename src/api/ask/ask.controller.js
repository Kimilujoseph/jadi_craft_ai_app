import { v4 as uuidv4 } from 'uuid';
import promptOrchestrator from '../../promptOrchestrator/index.js';

export const handleAsk = async (req, res, next) => {
  try {
    // If a middleware has already sent a response, do not continue.
    if (res.headersSent) {
      return;
    }

    const { question, wantsAudio = false, chatId = null } = req.body;
    const userId = req.user.user_id;

    if (!question || question === "undefined" || question.trim() === "") {
      return res.status(400).json({ message: "The question field is required and cannot be empty." });
    }

    const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();

    const response = await promptOrchestrator.handleQuestion({
      question,
      wantsAudio,
      userId,
      idempotencyKey,
      chatId,
    });

    if (!res.headersSent) {
      res.setHeader('x-idempotency-key', idempotencyKey);
      res.status(200).json(response);
    }
  } catch (error) {
    next(error);
  }
};