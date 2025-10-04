import express from "express";
import morgan from "morgan"
import cookieParser from 'cookie-parser';
import askRouter from './api/ask/ask.route.js';
import authRouter from './api/auth/auth.route.js';
import chatRouter from './api/chat/chat.route.js';
import errorHandler from './middleware/errorHandler.js';

const App = async (app) => {
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(morgan("dev"));
   app.use(cookieParser());

   // Serve generated audio files
   app.use(express.static('public'));

   // Define API routes
   app.use('/api/v2/ask', askRouter);
   app.use('/api/v1/auth', authRouter);
   app.use('/api/v1/chats', chatRouter);

   // Error Handling Middleware
   app.use(errorHandler);
}

export { App }
