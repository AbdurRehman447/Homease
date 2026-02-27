import prisma from '../config/database.js';

// Calculate provider's average rating
export const calculateProviderRating = async (providerId) => {
  const reviews = await prisma.review.findMany({
    where: {
      providerId,
      isVisible: true,
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

  return {
    averageRating,
    totalReviews: reviews.length,
  };
};

// Update provider rating in database
export const updateProviderRating = async (providerId) => {
  const { averageRating, totalReviews } = await calculateProviderRating(providerId);

  await prisma.provider.update({
    where: { id: providerId },
    data: {
      rating: averageRating,
      totalReviews,
    },
  });

  return { averageRating, totalReviews };
};

// Get rating statistics for a provider
export const getProviderRatingStats = async (providerId) => {
  const reviews = await prisma.review.findMany({
    where: {
      providerId,
      isVisible: true,
    },
    select: {
      rating: true,
    },
  });

  // Count ratings by star level
  const ratingCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    const rating = Math.floor(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? parseFloat(
          (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
        )
      : 0;

  // Calculate percentages
  const ratingDistribution = Object.entries(ratingCounts).map(([stars, count]) => ({
    stars: parseInt(stars),
    count,
    percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
  }));

  return {
    averageRating,
    totalReviews,
    distribution: ratingDistribution.reverse(), // 5 to 1
  };
};

// Check if user can review a booking
export const canUserReview = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      review: true,
    },
  });

  if (!booking) {
    return { canReview: false, reason: 'Booking not found' };
  }

  // Only customer can review
  if (booking.customerId !== userId) {
    return { canReview: false, reason: 'Only the customer can review this booking' };
  }

  // Booking must be completed
  if (booking.status !== 'COMPLETED') {
    return { canReview: false, reason: 'Can only review completed bookings' };
  }

  // Check if already reviewed
  if (booking.review) {
    return { canReview: false, reason: 'Booking already reviewed' };
  }

  return { canReview: true, booking };
};

// Validate review content
export const validateReviewContent = (rating, comment) => {
  // Rating must be between 1 and 5
  if (rating < 1 || rating > 5) {
    return { valid: false, message: 'Rating must be between 1 and 5' };
  }

  // Comment is optional but if provided, check length
  if (comment && comment.length > 1000) {
    return { valid: false, message: 'Comment cannot exceed 1000 characters' };
  }

  // Check for inappropriate content (basic check)
  if (comment) {
    const inappropriateWords = ['spam', 'fake']; // Extend as needed
    const lowerComment = comment.toLowerCase();
    const hasInappropriate = inappropriateWords.some((word) => lowerComment.includes(word));
    
    if (hasInappropriate) {
      return { valid: false, message: 'Comment contains inappropriate content' };
    }
  }

  return { valid: true };
};

export default {
  calculateProviderRating,
  updateProviderRating,
  getProviderRatingStats,
  canUserReview,
  validateReviewContent,
};
