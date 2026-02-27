import { Router } from "express";
import { initiatePayment, paymentCallback, checkPaymentStatus } from "./payment.controller.js";
import authMiddleware from "../../middleware/auth.js";

const paymentRouter = Router();

// Endpoint for the vendor to start the payment
paymentRouter.post("/initiate", authMiddleware, initiatePayment);

// Endpoint for Payhero to send the payment callback (webhook, no auth)
paymentRouter.post("/callback", paymentCallback);

// Endpoint for polling status from frontend
paymentRouter.get("/status/:transactionId", authMiddleware, checkPaymentStatus);

export default paymentRouter;
