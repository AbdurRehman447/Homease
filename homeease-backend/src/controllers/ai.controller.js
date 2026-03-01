import prisma from '../config/database.js';
import { successResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import { suggestServiceFromQuery } from '../services/ai.service.js';

/**
 * POST /api/ai/suggest-service
 * Body: { query: string }
 * Returns: { serviceId?, serviceName?, serviceType?, isUrgent?, suggestedDate?, suggestedTimeSlot? }
 * No auth required (used on landing page).
 */
export const suggestService = asyncHandler(async (req, res) => {
  const { query } = req.body || {};
  const trimmed = typeof query === 'string' ? query.trim() : '';
  const emptyPayload = {
    serviceId: null,
    serviceName: null,
    serviceType: null,
    suggestedCity: null,
    suggestedArea: null,
    isUrgent: false,
    suggestedDate: null,
    suggestedTimeSlot: null,
  };

  if (!trimmed) {
    return successResponse(res, 'No query provided', emptyPayload);
  }

  const [servicesList, citiesRows] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.city.findMany({ select: { name: true } }),
  ]);

  const cityNames = citiesRows.map((c) => c.name);
  if (servicesList.length === 0) {
    return successResponse(res, 'No services available', emptyPayload);
  }

  const result = await suggestServiceFromQuery(trimmed, servicesList, cityNames);

  if (result.error) {
    console.log('AI suggestService error branch reached:', result.error);
    let errorMessage = 'AI suggestion unavailable; try selecting a service below';
    if (result.error === 'AI_RATE_LIMITED') {
      errorMessage = 'AI search is temporarily busy (rate limited). Please try generic search instead.';
    } else if (result.error === 'AI_MODEL_NOT_FOUND' || result.error === 'AI_SERVICE_NOT_CONFIGURED') {
      errorMessage = 'AI service is currently misconfigured. Please use generic search.';
    }

    return successResponse(res, errorMessage, {
      ...emptyPayload,
      error: result.error,
    });
  }

  return successResponse(res, 'Suggestion retrieved successfully', {
    serviceId: result.serviceId || null,
    serviceName: result.serviceName || null,
    serviceType: result.serviceType || null,
    suggestedCity: result.suggestedCity || null,
    suggestedArea: result.suggestedArea || null,
    isUrgent: Boolean(result.isUrgent),
    suggestedDate: result.suggestedDate || null,
    suggestedTimeSlot: result.suggestedTimeSlot || null,
  });
});

export default { suggestService };
