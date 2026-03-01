import express from 'express';
import authRoutes from './auth.routes.js';
import serviceRoutes from './service.routes.js';
import providerRoutes from './provider.routes.js';
import bookingRoutes from './booking.routes.js';
import uploadRoutes from './upload.routes.js';
import reviewRoutes from './review.routes.js';
import adminRoutes from './admin.routes.js';
import aiRoutes from './ai.routes.js';
import chatRoutes from './chat.routes.js';
import paymentRoutes from './payment.routes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);

// API Info
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'HomEase API v1',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      providers: '/api/providers',
      bookings: '/api/bookings',
      upload: '/api/upload',
      reviews: '/api/reviews',
      admin: '/api/admin',
      ai: '/api/ai',
      chat: '/api/chat',
      payments: '/api/payments',
      health: '/health',
    },
  });
});

export default router;
