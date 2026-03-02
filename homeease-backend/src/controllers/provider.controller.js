import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all providers with filtering
export const getAllProviders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    city,
    service,
    minRating,
    search,
    status = 'ACTIVE',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build filter conditions
  const where = {
    status,
    isActive: true,
    ...(city && { city }),
    ...(minRating && { rating: { gte: parseFloat(minRating) } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(service && {
      services: {
        some: {
          serviceId: service,
          isActive: true,
        },
      },
    }),
  };

  // Get providers with count
  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        experience: true,
        avatar: true,
        city: true,
        location: true,
        rating: true,
        totalReviews: true,
        totalBookings: true,
        completionRate: true,
        reliabilityScore: true,
        responseRate: true,
        cancellationRate: true,
        responseTime: true,
        isVerified: true,
        services: {
          where: { isActive: true },
          include: {
            service: true,
          },
        },
      },
      orderBy: [
        { reliabilityScore: 'desc' },
        { rating: 'desc' },
        { totalReviews: 'desc' },
      ],
    }),
    prisma.provider.count({ where }),
  ]);

  return paginatedResponse(res, 'Providers retrieved successfully', providers, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

// Get single provider by ID
export const getProviderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const provider = await prisma.provider.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      experience: true,
      avatar: true,
      coverImage: true,
      address: true,
      city: true,
      location: true,
      status: true,
      rating: true,
      totalReviews: true,
      totalBookings: true,
      completionRate: true,
      responseTime: true,
      isVerified: true,
      joinedDate: true,
      services: {
        where: { isActive: true },
        include: {
          service: true,
        },
      },
      reviews: {
        where: { isVisible: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!provider) {
    throw createError.notFound('Provider not found');
  }

  return successResponse(res, 'Provider retrieved successfully', provider);
});

// Update provider profile (Provider only)
export const updateProviderProfile = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { bio, experience, address, city, location, responseTime } = req.body;

  const provider = await prisma.provider.update({
    where: { id: userId },
    data: {
      ...(bio && { bio }),
      ...(experience && { experience }),
      ...(address && { address }),
      ...(city && { city }),
      ...(location && { location }),
      ...(responseTime && { responseTime }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      experience: true,
      avatar: true,
      city: true,
      location: true,
      responseTime: true,
    },
  });

  return successResponse(res, 'Profile updated successfully', provider);
});

// Update provider services (Provider only)
export const updateProviderServices = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { services } = req.body; // Array of { serviceId, price, description }

  // Delete existing services
  await prisma.providerService.deleteMany({
    where: { providerId: userId },
  });

  // Create new service mappings
  const providerServices = services.map((service) => ({
    providerId: userId,
    serviceId: service.serviceId,
    price: parseFloat(service.price),
    description: service.description || null,
  }));

  await prisma.providerService.createMany({
    data: providerServices,
  });

  // Get updated provider with services
  const provider = await prisma.provider.findUnique({
    where: { id: userId },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  return successResponse(res, 'Services updated successfully', provider);
});

// Get provider stats (Provider only)
export const getProviderStats = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const [provider, bookingStats] = await Promise.all([
    prisma.provider.findUnique({
      where: { id: userId },
      select: {
        rating: true,
        totalReviews: true,
        totalBookings: true,
        completionRate: true,
      },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      where: { providerId: userId },
      _count: { status: true },
    }),
  ]);

  const stats = {
    overview: provider,
    bookingsByStatus: bookingStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {}),
  };

  return successResponse(res, 'Stats retrieved successfully', stats);
});

// Approve/Reject provider (Admin only)
export const updateProviderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED, REJECTED, SUSPENDED

  const provider = await prisma.provider.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });

  return successResponse(res, `Provider status updated to ${status}`, provider);
});

export default {
  getAllProviders,
  getProviderById,
  updateProviderProfile,
  updateProviderServices,
  getProviderStats,
  updateProviderStatus,
};
