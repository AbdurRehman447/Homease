import express from 'express';
import {
  getAllProviders,
  getProviderById,
  updateProviderProfile,
  updateProviderServices,
  getProviderStats,
  updateProviderStatus,
} from '../controllers/provider.controller.js';
import { authenticate, isProvider, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProviders);
router.get('/:id', getProviderById);

// Provider routes (protected)
router.put('/profile', authenticate, isProvider, updateProviderProfile);
router.put('/services', authenticate, isProvider, updateProviderServices);
router.get('/stats/me', authenticate, isProvider, getProviderStats);

// Admin routes
router.patch('/:id/status', authenticate, isAdmin, updateProviderStatus);

export default router;
