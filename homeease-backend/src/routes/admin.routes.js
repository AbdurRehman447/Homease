import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  approveProvider,
  rejectProvider,
  suspendProvider,
  toggleUserStatus,
  getAllBookings,
  getAnalytics,
} from '../controllers/admin.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Users management
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Providers management
router.get('/providers', getAllProviders);
router.post('/providers', createProvider);
router.put('/providers/:id', updateProvider);
router.delete('/providers/:id', deleteProvider);
router.patch('/providers/:id/approve', approveProvider);
router.patch('/providers/:id/reject', rejectProvider);
router.patch('/providers/:id/suspend', suspendProvider);

// Bookings management
router.get('/bookings', getAllBookings);

export default router;
