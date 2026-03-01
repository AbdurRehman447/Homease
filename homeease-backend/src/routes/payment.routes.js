import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// Allow public access to methods (for guest booking flow)
router.get('/methods', paymentController.getMethods);

// Protecting the process endpoint (optional, but good practice for FYP)
router.post('/process', optionalAuthenticate, paymentController.processPayment);

export default router;
