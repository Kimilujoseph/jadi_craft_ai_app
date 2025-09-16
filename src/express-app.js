import express from "express";
import morgan from "morgan"
import askRouter from './api/ask.js';
import errorHandler from './middleware/errorHandler.js';

const app = express()

const App = async (app) => {
   app.use(express.json())
   app.use(express.urlencoded({ extended: true }))
   app.use(morgan("dev"))
   app.use('/ask', askRouter);

   // Error Handling Middleware
   app.use(errorHandler);
}


export { App }
