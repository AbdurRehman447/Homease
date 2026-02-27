import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  checkAvailability,
  getAvailabilityRange,
  getBookingStatistics,
} from '../controllers/booking.controller.js';
import { authenticate, isCustomer, isProvider, isProviderOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
} from '../validators/booking.validator.js';

const router = express.Router();

// Public routes
router.get('/availability/check', checkAvailability);
router.get('/availability/range', getAvailabilityRange);

// All other booking routes require authentication
router.use(authenticate);

// Get bookings (filtered by role)
router.get('/', getAllBookings);
router.get('/statistics', isProviderOrAdmin, getBookingStatistics);
router.get('/:id', getBookingById);

// Create booking (customer only)
router.post('/', isCustomer, validate(createBookingSchema), createBooking);

// Update booking status
router.patch('/:id/status', validate(updateBookingStatusSchema), updateBookingStatus);

// Cancel booking (customer only)
router.post('/:id/cancel', isCustomer, validate(cancelBookingSchema), cancelBooking);

export default router;
