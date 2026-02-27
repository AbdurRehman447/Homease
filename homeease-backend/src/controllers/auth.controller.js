import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { createError } from '../utils/ApiError.js';
import { successResponse, createdResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';

// Register new user (customer)
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, city } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError.conflict('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      role: 'CUSTOMER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      city: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const tokens = generateTokenPair(user.id, user.email, user.role);

  return createdResponse(res, 'User registered successfully', {
    user,
    ...tokens,
  });
});

// Register new provider
export const registerProvider = asyncHandler(async (req, res) => {
  const { name, email, password, phone, bio, experience, address, city, location, services } = req.body;

  // Check if provider already exists
  const existingProvider = await prisma.provider.findUnique({
    where: { email },
  });

  if (existingProvider) {
    throw createError.conflict('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create provider
  const provider = await prisma.provider.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      bio,
      experience,
      address,
      city,
      location,
      status: 'PENDING', // Requires admin approval
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      experience: true,
      city: true,
      location: true,
      status: true,
      createdAt: true,
    },
  });

  // Link provider with services
  if (services && services.length > 0) {
    const providerServices = services.map((serviceId) => ({
      providerId: provider.id,
      serviceId,
      price: 0, // Provider will set prices later
    }));

    await prisma.providerService.createMany({
      data: providerServices,
    });
  }

  // Generate tokens (role is PROVIDER)
  const tokens = generateTokenPair(provider.id, provider.email, 'PROVIDER');

  return createdResponse(res, 'Provider registration submitted for approval', {
    provider,
    ...tokens,
  });
});

// Login user or provider
export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  let user = null;
  let userRole = role;

  // If role is specified, search in specific table
  if (role === 'PROVIDER') {
    user = await prisma.provider.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        avatar: true,
        city: true,
        status: true,
        isActive: true,
      },
    });
    userRole = 'PROVIDER';
  } else if (role === 'CUSTOMER' || role === 'ADMIN') {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        role: true,
        avatar: true,
        city: true,
        isActive: true,
      },
    });
    userRole = user?.role;
  } else {
    // Try both tables if role not specified
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        role: true,
        avatar: true,
        city: true,
        isActive: true,
      },
    });

    if (user) {
      userRole = user.role;
    } else {
      // Try provider table
      user = await prisma.provider.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          phone: true,
          avatar: true,
          city: true,
          status: true,
          isActive: true,
        },
      });
      userRole = 'PROVIDER';
    }
  }

  // Check if user exists
  if (!user) {
    throw createError.unauthorized('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw createError.forbidden('Your account has been deactivated');
  }

  // For providers, check approval status
  if (userRole === 'PROVIDER' && user.status === 'PENDING') {
    throw createError.forbidden('Your account is pending approval');
  }

  if (userRole === 'PROVIDER' && user.status === 'REJECTED') {
    throw createError.forbidden('Your provider application was rejected');
  }

  if (userRole === 'PROVIDER' && user.status === 'SUSPENDED') {
    throw createError.forbidden('Your account has been suspended');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw createError.unauthorized('Invalid email or password');
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Generate tokens
  const tokens = generateTokenPair(user.id, user.email, userRole);

  return successResponse(res, 'Login successful', {
    user: { ...userWithoutPassword, role: userRole },
    ...tokens,
  });
});

// Refresh access token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Generate new token pair
  const tokens = generateTokenPair(decoded.userId, decoded.email, decoded.role);

  return successResponse(res, 'Token refreshed successfully', tokens);
});

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  const { userId, role } = req.user;

  let profile = null;

  if (role === 'PROVIDER') {
    profile = await prisma.provider.findUnique({
      where: { id: userId },
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
          include: {
            service: true,
          },
        },
      },
    });
  } else {
    profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        address: true,
        city: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  if (!profile) {
    throw createError.notFound('Profile not found');
  }

  return successResponse(res, 'Profile retrieved successfully', { profile, role });
});

// Logout (client-side token removal)
export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, 'Logged out successfully');
});

export default {
  registerUser,
  registerProvider,
  login,
  refreshToken,
  getProfile,
  logout,
};
