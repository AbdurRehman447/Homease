import express from 'express';
import {
  createReview,
  getProviderReviews,
  getProviderRatingStatistics,
  getReviewById,
  updateReview,
  deleteReview,
  respondToReview,
  getMyReviews,
} from '../controllers/review.controller.js';
import { authenticate, isCustomer, isProvider, isCustomerOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createReviewSchema,
  updateReviewSchema,
  respondToReviewSchema,
} from '../validators/review.validator.js';

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/provider/:providerId/stats', getProviderRatingStatistics);

// Protected routes
router.use(authenticate);

// Customer routes
router.post('/', isCustomer, validate(createReviewSchema), createReview);
router.get('/my-reviews', isCustomer, getMyReviews);
router.put('/:id', isCustomer, validate(updateReviewSchema), updateReview);
router.delete('/:id', isCustomerOrAdmin, deleteReview);

// Provider routes
router.post('/:id/respond', isProvider, validate(respondToReviewSchema), respondToReview);

// General routes
router.get('/:id', getReviewById);

export default router;
