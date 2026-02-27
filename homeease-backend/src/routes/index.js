import express from 'express';
import authRoutes from './auth.routes.js';
import serviceRoutes from './service.routes.js';
import providerRoutes from './provider.routes.js';
import bookingRoutes from './booking.routes.js';
import uploadRoutes from './upload.routes.js';
import reviewRoutes from './review.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

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
      health: '/health',
    },
  });
});

export default router;
