import prisma from '../config/database.js';

// Check if provider is available for a specific date and time
export const checkProviderAvailability = async (providerId, date, timeSlot) => {
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(bookingDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Check for existing bookings at the same time
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      date: {
        gte: bookingDate,
        lt: nextDay,
      },
      timeSlot,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
  });

  return {
    isAvailable: conflictingBookings.length === 0,
    conflictingBookings,
  };
};

// Get provider's availability for a date range
export const getProviderAvailabilityRange = async (providerId, startDate, endDate) => {
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
    select: {
      date: true,
      timeSlot: true,
      status: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  return bookings;
};

// Validate booking date and time
export const validateBookingDateTime = (date, timeSlot) => {
  const bookingDate = new Date(date);
  const now = new Date();

  // Check if date is in the past
  if (bookingDate < now) {
    return {
      valid: false,
      message: 'Booking date cannot be in the past',
    };
  }

  // Check if booking is at least 2 hours in advance
  const minAdvanceTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (bookingDate < minAdvanceTime) {
    return {
      valid: false,
      message: 'Bookings must be made at least 2 hours in advance',
    };
  }

  // Check if booking is not more than 90 days in advance
  const maxAdvanceTime = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (bookingDate > maxAdvanceTime) {
    return {
      valid: false,
      message: 'Bookings cannot be made more than 90 days in advance',
    };
  }

  // Validate time slot format (e.g., "09:00 AM", "02:00 PM")
  const timeSlotRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
  if (!timeSlotRegex.test(timeSlot)) {
    return {
      valid: false,
      message: 'Invalid time slot format. Use format: HH:MM AM/PM',
    };
  }

  return { valid: true };
};

// Check cancellation eligibility
export const checkCancellationEligibility = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { eligible: false, message: 'Booking not found' };
  }

  // Cannot cancel completed or already cancelled bookings
  if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
    return { eligible: false, message: 'Cannot cancel this booking' };
  }

  // Check cancellation window (24 hours before booking)
  const bookingDateTime = new Date(booking.date);
  const now = new Date();
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

  if (hoursUntilBooking < 24) {
    return {
      eligible: true,
      refundEligible: false,
      message: 'Booking can be cancelled but no refund (less than 24 hours)',
    };
  }

  return {
    eligible: true,
    refundEligible: true,
    message: 'Full refund available',
  };
};

// Calculate booking price with dynamic pricing
export const calculateBookingPrice = async (serviceId, providerId, date) => {
  // Get provider service price
  const providerService = await prisma.providerService.findFirst({
    where: {
      providerId,
      serviceId,
      isActive: true,
    },
  });

  if (!providerService) {
    throw new Error('Provider does not offer this service');
  }

  let basePrice = providerService.price;

  // Weekend pricing (20% increase)
  const bookingDate = new Date(date);
  const dayOfWeek = bookingDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Sunday or Saturday
    basePrice = basePrice * 1.2;
  }

  // Platform fee (10%)
  const platformFee = Math.round(basePrice * 0.1);
  const totalAmount = basePrice + platformFee;

  return {
    basePrice: Math.round(basePrice),
    platformFee,
    totalAmount,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  };
};

// Get booking statistics for a provider
export const getBookingStats = async (providerId, startDate, endDate) => {
  const whereClause = {
    providerId,
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  const [totalBookings, statusCounts, revenueData] = await Promise.all([
    prisma.booking.count({ where: whereClause }),
    prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true },
    }),
    prisma.booking.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
      },
      _sum: {
        price: true,
        totalAmount: true,
      },
    }),
  ]);

  const stats = {
    total: totalBookings,
    byStatus: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
    revenue: {
      total: revenueData._sum.totalAmount || 0,
      providerEarnings: revenueData._sum.price || 0,
    },
  };

  return stats;
};

export default {
  checkProviderAvailability,
  getProviderAvailabilityRange,
  validateBookingDateTime,
  checkCancellationEligibility,
  calculateBookingPrice,
  getBookingStats,
};
