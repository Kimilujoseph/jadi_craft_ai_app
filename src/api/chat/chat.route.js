import express from 'express';
import { getChats, getChatMessages } from './chat.controller.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

// All routes in this file are protected by the authMiddleware
router.use(authMiddleware);

router.get('/', getChats);
router.get('/:chatId', getChatMessages);

export default router;
