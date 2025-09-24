import express from "express";
import morgan from "morgan"
import askRouter from './api/ask.js';
import authRouter from './api/auth/auth.route.js';
import errorHandler from './middleware/errorHandler.js';

const app = express()

const App = async (app) => {
   app.use(express.json())
   app.use(express.urlencoded({ extended: true }))
   app.use(morgan("dev"))

   // Serve generated audio files
   app.use(express.static('public'));

   app.use('/api/v1', askRouter);
   app.use('/auth', authRouter);

   // Error Handling Middleware
   app.use(errorHandler);
}


export { App }
