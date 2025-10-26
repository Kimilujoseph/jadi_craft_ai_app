import express from "express";
import morgan from "morgan"
import cookieParser from 'cookie-parser';
import cors from 'cors';
import askRouter from './api/ask/ask.route.js';
import authRouter from './api/auth/auth.route.js';
import chatRouter from './api/chat/chat.route.js';
import marketplaceRouter from './api/marketplace/marketplace.route.js';
import errorHandler from './middleware/errorHandler.js';

const App = async (app) => {
  // Add CORS middleware before other middleware
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? "https://your-production-frontend-domain.com"
          : [
              "http://localhost:3000",
              "http://127.0.0.1:3000",
              "http://localhost:5173",
            ],
      credentials: true, // Important for cookies/auth
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
    })
  );
//   untouched part
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(cookieParser());

  // Serve generated audio files
  app.use(express.static("public"));

  app.use("/api/v1", askRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/chats", chatRouter);
  app.use("/api/v1/marketplace", marketplaceRouter);

  // Error Handling Middleware
  app.use(errorHandler);
}

export { App }
