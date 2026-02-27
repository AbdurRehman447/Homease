import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    totalProviders,
    totalCustomers,
    totalServices,
    pendingProviders,
    activeProviders,
    bookingsByStatus,
    recentBookings,
  ] = await Promise.all([
    // Total bookings
    prisma.booking.count(),
    
    // Total providers
    prisma.provider.count(),
    
    // Total customers
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    
    // Total services
    prisma.service.count({ where: { isActive: true } }),
    
    // Pending providers
    prisma.provider.count({ where: { status: 'PENDING' } }),
    
    // Active providers
    prisma.provider.count({ where: { status: 'APPROVED', isActive: true } }),
    
    // Bookings by status
    prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    
    // Recent bookings for revenue calculation
    prisma.booking.findMany({
      select: { totalAmount: true, platformFee: true },
    }),
  ]);

  // Calculate revenue
  const totalRevenue = recentBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const platformRevenue = recentBookings.reduce((sum, b) => sum + b.platformFee, 0);

  // Format booking status counts
  const bookingStats = {
    PENDING: 0,
    CONFIRMED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  bookingsByStatus.forEach((item) => {
    bookingStats[item.status] = item._count.status;
  });

  return successResponse(res, 'Dashboard stats retrieved successfully', {
    overview: {
      totalBookings,
      totalProviders,
      totalCustomers,
      totalServices,
      totalRevenue,
      platformRevenue,
    },
    providers: {
      pending: pendingProviders,
      active: activeProviders,
      total: totalProviders,
    },
    bookings: bookingStats,
  });
});

// Get all users (customers)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, city, isActive } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    role: 'CUSTOMER',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(city && { city }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        city: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(res, 'Users retrieved successfully', users, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

// Get all providers for admin
export const getAllProviders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, city, status } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(city && { city }),
    ...(status && { status }),
  };

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
        avatar: true,
        city: true,
        status: true,
        isActive: true,
        isVerified: true,
        rating: true,
        totalReviews: true,
        totalBookings: true,
        createdAt: true,
        joinedDate: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.provider.count({ where }),
  ]);

  return paginatedResponse(res, 'Providers retrieved successfully', providers, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

// Approve provider
export const approveProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const provider = await prisma.provider.update({
    where: { id },
    data: { 
      status: 'APPROVED',
      isVerified: true,
    },
  });

  return successResponse(res, 'Provider approved successfully', provider);
});

// Reject provider
export const rejectProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const provider = await prisma.provider.update({
    where: { id },
    data: { 
      status: 'REJECTED',
    },
  });

  // TODO: Send notification to provider about rejection

  return successResponse(res, 'Provider rejected successfully', { provider, reason });
});

// Suspend provider
export const suspendProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const provider = await prisma.provider.update({
    where: { id },
    data: { 
      status: 'SUSPENDED',
      isActive: false,
    },
  });

  // TODO: Send notification to provider about suspension

  return successResponse(res, 'Provider suspended successfully', { provider, reason });
});

// Toggle user active status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createError.notFound('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  return successResponse(
    res,
    `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
    updatedUser
  );
});

// Get all bookings for admin
export const getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, city, startDate, endDate } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(status && { status }),
    ...(city && { city }),
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
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
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            category: true,
          },
        },
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

// Get analytics data
export const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    bookingsOverTime,
    revenueData,
    topProviders,
    topServices,
    cityStats,
  ] = await Promise.all([
    // Bookings over time
    prisma.booking.groupBy({
      by: ['date'],
      where: { date: { gte: startDate } },
      _count: { id: true },
      orderBy: { date: 'asc' },
    }),

    // Revenue data
    prisma.booking.aggregate({
      where: { date: { gte: startDate } },
      _sum: { totalAmount: true, platformFee: true },
      _avg: { totalAmount: true },
    }),

    // Top providers by bookings
    prisma.provider.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        rating: true,
        totalBookings: true,
        totalReviews: true,
      },
      orderBy: { totalBookings: 'desc' },
      take: 10,
    }),

    // Top services
    prisma.booking.groupBy({
      by: ['serviceId', 'serviceName'],
      where: { date: { gte: startDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Bookings by city
    prisma.booking.groupBy({
      by: ['city'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);

  return successResponse(res, 'Analytics data retrieved successfully', {
    bookingsOverTime,
    revenue: {
      total: revenueData._sum.totalAmount || 0,
      platformFee: revenueData._sum.platformFee || 0,
      average: revenueData._avg.totalAmount || 0,
    },
    topProviders,
    topServices,
    cityStats,
  });
});

// Create provider (Admin)
export const createProvider = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    bio,
    experience,
    city,
    location,
    address,
    status = 'PENDING'
  } = req.body;

  // Check if provider already exists
  const existingProvider = await prisma.provider.findUnique({
    where: { email },
  });

  if (existingProvider) {
    throw createError.badRequest('Provider with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password || 'demo123', 10);

  // Create provider
  const provider = await prisma.provider.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      bio,
      experience: experience ? parseInt(experience) : 0,
      city,
      location,
      address,
      status,
      isActive: true,
      isVerified: status === 'APPROVED',
      joinedDate: new Date(),
    },
  });

  // Remove password from response
  const { password: _, ...providerWithoutPassword } = provider;

  return successResponse(res, 'Provider created successfully', providerWithoutPassword);
});

// Update provider (Admin)
export const updateProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    bio,
    experience,
    city,
    location,
    address,
    status,
    isActive,
    isVerified
  } = req.body;

  // Check if provider exists
  const existingProvider = await prisma.provider.findUnique({
    where: { id },
  });

  if (!existingProvider) {
    throw createError.notFound('Provider not found');
  }

  // If email is being changed, check for duplicates
  if (email && email !== existingProvider.email) {
    const emailExists = await prisma.provider.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw createError.badRequest('Email already in use by another provider');
    }
  }

  // Update provider
  const provider = await prisma.provider.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(bio && { bio }),
      ...(experience !== undefined && { experience: parseInt(experience) }),
      ...(city && { city }),
      ...(location && { location }),
      ...(address && { address }),
      ...(status && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(isVerified !== undefined && { isVerified }),
    },
  });

  // Remove password from response
  const { password: _, ...providerWithoutPassword } = provider;

  return successResponse(res, 'Provider updated successfully', providerWithoutPassword);
});

// Delete provider (Admin)
export const deleteProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if provider exists
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      bookings: {
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
          }
        }
      }
    }
  });

  if (!provider) {
    throw createError.notFound('Provider not found');
  }

  // Check if provider has active bookings
  if (provider.bookings.length > 0) {
    throw createError.badRequest('Cannot delete provider with active bookings. Please cancel or complete all bookings first.');
  }

  // Delete provider
  await prisma.provider.delete({
    where: { id },
  });

  return successResponse(res, 'Provider deleted successfully', { id });
});

export default {
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
};
