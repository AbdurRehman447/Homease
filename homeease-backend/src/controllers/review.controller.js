import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  updateProviderRating,
  getProviderRatingStats,
  canUserReview,
  validateReviewContent,
} from '../services/review.service.js';

// Create a review (Customer only)
export const createReview = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { bookingId, rating, comment } = req.body;

  // Check if user can review this booking
  const reviewEligibility = await canUserReview(bookingId, userId);
  if (!reviewEligibility.canReview) {
    throw createError.badRequest(reviewEligibility.reason);
  }

  // Validate review content
  const contentValidation = validateReviewContent(rating, comment);
  if (!contentValidation.valid) {
    throw createError.badRequest(contentValidation.message);
  }

  const booking = reviewEligibility.booking;

  // Create review
  const review = await prisma.review.create({
    data: {
      bookingId,
      customerId: userId,
      providerId: booking.providerId,
      rating: parseFloat(rating),
      comment,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      booking: {
        select: {
          serviceName: true,
          date: true,
        },
      },
    },
  });

  // Update provider's rating
  const updatedRating = await updateProviderRating(booking.providerId);

  return successResponse(res, 'Review submitted successfully', {
    review,
    providerRating: updatedRating,
  }, 201);
});

// Get all reviews for a provider
export const getProviderReviews = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    providerId,
    isVisible: true,
    ...(rating && { rating: parseFloat(rating) }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      include: {
        customer: {
          select: {
            name: true,
            avatar: true,
          },
        },
        booking: {
          select: {
            serviceName: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.review.count({ where }),
  ]);

  return paginatedResponse(res, 'Reviews retrieved successfully', reviews, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

// Get provider rating statistics
export const getProviderRatingStatistics = asyncHandler(async (req, res) => {
  const { providerId } = req.params;

  const stats = await getProviderRatingStats(providerId);

  return successResponse(res, 'Rating statistics retrieved successfully', stats);
});

// Get review by ID
export const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          name: true,
          avatar: true,
        },
      },
      provider: {
        select: {
          name: true,
          avatar: true,
        },
      },
      booking: {
        select: {
          serviceName: true,
          date: true,
        },
      },
    },
  });

  if (!review) {
    throw createError.notFound('Review not found');
  }

  return successResponse(res, 'Review retrieved successfully', review);
});

// Update review (Customer only - within 7 days)
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { rating, comment } = req.body;

  // Get existing review
  const existingReview = await prisma.review.findUnique({
    where: { id },
  });

  if (!existingReview) {
    throw createError.notFound('Review not found');
  }

  // Check ownership
  if (existingReview.customerId !== userId) {
    throw createError.forbidden('You can only update your own reviews');
  }

  // Check if within 7 days
  const daysSinceReview = (new Date() - new Date(existingReview.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceReview > 7) {
    throw createError.badRequest('Reviews can only be edited within 7 days');
  }

  // Validate new content
  const contentValidation = validateReviewContent(rating, comment);
  if (!contentValidation.valid) {
    throw createError.badRequest(contentValidation.message);
  }

  // Update review
  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      ...(rating && { rating: parseFloat(rating) }),
      ...(comment && { comment }),
    },
    include: {
      customer: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Update provider's rating
  await updateProviderRating(existingReview.providerId);

  return successResponse(res, 'Review updated successfully', updatedReview);
});

// Delete/Hide review (Customer or Admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw createError.notFound('Review not found');
  }

  // Check permissions
  if (role !== 'ADMIN' && review.customerId !== userId) {
    throw createError.forbidden('You can only delete your own reviews');
  }

  // Soft delete (hide review)
  await prisma.review.update({
    where: { id },
    data: { isVisible: false },
  });

  // Update provider's rating
  await updateProviderRating(review.providerId);

  return successResponse(res, 'Review deleted successfully');
});

// Provider response to review
export const respondToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { response } = req.body;

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw createError.notFound('Review not found');
  }

  // Check if provider owns this review
  if (review.providerId !== userId) {
    throw createError.forbidden('You can only respond to your own reviews');
  }

  // Validate response length
  if (response.length > 500) {
    throw createError.badRequest('Response cannot exceed 500 characters');
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: { response },
    include: {
      customer: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  });

  return successResponse(res, 'Response added successfully', updatedReview);
});

// Get customer's reviews (their own reviews)
export const getMyReviews = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { customerId: userId },
      skip,
      take,
      include: {
        provider: {
          select: {
            name: true,
            avatar: true,
          },
        },
        booking: {
          select: {
            serviceName: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.review.count({ where: { customerId: userId } }),
  ]);

  return paginatedResponse(res, 'Your reviews retrieved successfully', reviews, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

export default {
  createReview,
  getProviderReviews,
  getProviderRatingStatistics,
  getReviewById,
  updateReview,
  deleteReview,
  respondToReview,
  getMyReviews,
};
