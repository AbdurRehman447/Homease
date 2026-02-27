import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  checkProviderAvailability,
  validateBookingDateTime,
  calculateBookingPrice,
  checkCancellationEligibility,
  getBookingStats,
  getProviderAvailabilityRange,
} from '../services/booking.service.js';

// Get all bookings (with role-based filtering)
export const getAllBookings = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { page = 1, limit = 10, status } = req.query;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  
  // Build filter based on role
  const where = {
    ...(role === 'CUSTOMER' && { customerId: userId }),
    ...(role === 'PROVIDER' && { providerId: userId }),
    ...(status && { status }),
  };
  
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            rating: true,
          },
        },
        service: {
          select: {
            name: true,
            category: true,
            icon: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);
  
  return paginatedResponse(res, 'Bookings retrieved successfully', bookings, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

// Get single booking by ID
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          address: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
      service: true,
      payment: true,
      review: true,
    },
  });
  
  if (!booking) {
    throw createError.notFound('Booking not found');
  }
  
  // Verify access rights
  if (role === 'CUSTOMER' && booking.customerId !== userId) {
    throw createError.forbidden('You can only view your own bookings');
  }
  
  if (role === 'PROVIDER' && booking.providerId !== userId) {
    throw createError.forbidden('You can only view your own bookings');
  }
  
  return successResponse(res, 'Booking retrieved successfully', booking);
});

// Create new booking (Customer only)
export const createBooking = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const {
    providerId,
    serviceId,
    date,
    timeSlot,
    address,
    area,
    city,
    notes,
    jobDescription,
  } = req.body;

  // Validate date and time
  const dateValidation = validateBookingDateTime(date, timeSlot);
  if (!dateValidation.valid) {
    throw createError.badRequest(dateValidation.message);
  }

  // Check provider availability
  const availability = await checkProviderAvailability(providerId, date, timeSlot);
  if (!availability.isAvailable) {
    throw createError.conflict(
      'Provider is not available at this time. Please choose a different time slot.'
    );
  }

  // Verify provider exists and is active
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      services: {
        where: { serviceId, isActive: true },
      },
    },
  });

  if (!provider || (provider.status !== 'ACTIVE' && provider.status !== 'APPROVED')) {
    throw createError.badRequest('Provider not available');
  }

  if (provider.services.length === 0) {
    throw createError.badRequest('Provider does not offer this service');
  }

  // Get service details
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw createError.notFound('Service not found');
  }

  // Calculate pricing with dynamic pricing
  const pricing = await calculateBookingPrice(serviceId, providerId, date);

  // Generate booking number
  const bookingNumber = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      customerId: userId,
      providerId,
      serviceId,
      serviceName: service.name,
      date: new Date(date),
      timeSlot,
      price: pricing.basePrice,
      platformFee: pricing.platformFee,
      totalAmount: pricing.totalAmount,
      address,
      area,
      city,
      notes,
      jobDescription,
      status: 'PENDING',
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      provider: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      service: true,
    },
  });

  // TODO: Send notification to provider about new booking

  return successResponse(res, 'Booking created successfully', {
    booking,
    pricing: {
      ...pricing,
      message: pricing.isWeekend ? 'Weekend pricing applied (+20%)' : 'Standard pricing',
    },
  }, 201);
});

// Update booking status (Provider/Admin)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, cancellationReason } = req.body;
  const { userId, role } = req.user;
  
  // Get booking
  const booking = await prisma.booking.findUnique({
    where: { id },
  });
  
  if (!booking) {
    throw createError.notFound('Booking not found');
  }
  
  // Verify access
  if (role === 'PROVIDER' && booking.providerId !== userId) {
    throw createError.forbidden('You can only update your own bookings');
  }
  
  if (role === 'CUSTOMER' && booking.customerId !== userId && status !== 'CANCELLED') {
    throw createError.forbidden('Customers can only cancel their bookings');
  }
  
  // Update booking
  const updateData = {
    status,
    ...(cancellationReason && { cancellationReason }),
    ...(status === 'COMPLETED' && { completedAt: new Date() }),
  };
  
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      customer: {
        select: { name: true, email: true },
      },
      provider: {
        select: { name: true, email: true },
      },
    },
  });
  
  return successResponse(res, `Booking ${status.toLowerCase()} successfully`, updatedBooking);
});

// Cancel booking (Customer)
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const { userId } = req.user;

  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw createError.notFound('Booking not found');
  }

  if (booking.customerId !== userId) {
    throw createError.forbidden('You can only cancel your own bookings');
  }

  // Check cancellation eligibility
  const eligibility = await checkCancellationEligibility(id);
  if (!eligibility.eligible) {
    throw createError.badRequest(eligibility.message);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason,
    },
  });

  // TODO: Process refund if eligible
  // TODO: Notify provider about cancellation

  return successResponse(res, 'Booking cancelled successfully', {
    booking: updatedBooking,
    refund: {
      eligible: eligibility.refundEligible,
      message: eligibility.message,
    },
  });
});

// Check provider availability
export const checkAvailability = asyncHandler(async (req, res) => {
  const { providerId, date, timeSlot } = req.query;

  if (!providerId || !date || !timeSlot) {
    throw createError.badRequest('Provider ID, date, and time slot are required');
  }

  const availability = await checkProviderAvailability(providerId, date, timeSlot);

  return successResponse(res, 'Availability checked successfully', {
    available: availability.isAvailable,
    providerId,
    date,
    timeSlot,
    ...((!availability.isAvailable) && {
      conflictingBookings: availability.conflictingBookings.length,
    }),
  });
});

// Get provider availability range
export const getAvailabilityRange = asyncHandler(async (req, res) => {
  const { providerId, startDate, endDate } = req.query;

  if (!providerId || !startDate || !endDate) {
    throw createError.badRequest('Provider ID, start date, and end date are required');
  }

  const bookings = await getProviderAvailabilityRange(providerId, startDate, endDate);

  return successResponse(res, 'Availability range retrieved successfully', {
    providerId,
    startDate,
    endDate,
    bookedSlots: bookings,
  });
});

// Get booking statistics (Provider/Admin)
export const getBookingStatistics = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;
  const { startDate, endDate } = req.query;

  let providerId = req.query.providerId;

  // If provider is accessing, use their own ID
  if (role === 'PROVIDER') {
    providerId = userId;
  }

  if (!providerId) {
    throw createError.badRequest('Provider ID is required');
  }

  const stats = await getBookingStats(providerId, startDate, endDate);

  return successResponse(res, 'Statistics retrieved successfully', stats);
});

export default {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  checkAvailability,
  getAvailabilityRange,
  getBookingStatistics,
};
