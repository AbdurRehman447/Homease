import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all services with pagination and filtering
export const getAllServices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, popular, active = 'true' } = req.query;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  
  // Build filter conditions
  const where = {
    ...(active === 'true' && { isActive: true }),
    ...(category && { category }),
    ...(popular === 'true' && { isPopular: true }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
  
  // Get services with count
  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take,
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' },
      ],
    }),
    prisma.service.count({ where }),
  ]);
  
  return paginatedResponse(res, 'Services retrieved successfully', services, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

// Get single service by ID
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      providers: {
        where: { isActive: true },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
              totalReviews: true,
              city: true,
              location: true,
            },
          },
        },
      },
    },
  });
  
  if (!service) {
    throw createError.notFound('Service not found');
  }
  
  return successResponse(res, 'Service retrieved successfully', service);
});

// Get service categories
export const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.service.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { category: true },
  });
  
  const formattedCategories = categories.map((cat) => ({
    name: cat.category,
    count: cat._count.category,
  }));
  
  return successResponse(res, 'Categories retrieved successfully', formattedCategories);
});

// Create service (Admin only)
export const createService = asyncHandler(async (req, res) => {
  const { name, category, description, icon, basePrice, duration, isPopular } = req.body;
  
  // Check if service already exists
  const existingService = await prisma.service.findUnique({
    where: { name },
  });
  
  if (existingService) {
    throw createError.conflict('Service with this name already exists');
  }
  
  const service = await prisma.service.create({
    data: {
      name,
      category,
      description,
      icon,
      basePrice: parseFloat(basePrice),
      duration,
      isPopular: isPopular || false,
    },
  });
  
  return successResponse(res, 'Service created successfully', service, 201);
});

// Update service (Admin only)
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Check if service exists
  const existingService = await prisma.service.findUnique({
    where: { id },
  });
  
  if (!existingService) {
    throw createError.notFound('Service not found');
  }
  
  const service = await prisma.service.update({
    where: { id },
    data: updateData,
  });
  
  return successResponse(res, 'Service updated successfully', service);
});

// Delete/Deactivate service (Admin only)
export const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Soft delete by setting isActive to false
  const service = await prisma.service.update({
    where: { id },
    data: { isActive: false },
  });
  
  return successResponse(res, 'Service deactivated successfully', service);
});

export default {
  getAllServices,
  getServiceById,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
};
