import prisma from '../config/database.js';
import { successResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import paymentService from '../services/payment.service.js';

// Get available payment methods
export const getMethods = asyncHandler(async (req, res) => {
    let methods = await prisma.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    // Self-healing: If no methods found, create the defaults
    if (methods.length === 0) {
        const defaults = [
            { name: 'JazzCash', type: 'wallet', description: 'Instant mobile wallet payment' },
            { name: 'Easypaisa', type: 'wallet', description: 'Fast mobile wallet transfer' },
            { name: 'Bank Transfer', type: 'bank', description: 'Manual verification (24-48 hours)', metadata: { accountName: 'Homease Pvt Ltd', accountNumber: '0123456789', bankName: 'Alfalah Bank', branchCode: '0451' } },
            { name: 'COD', type: 'offline', description: 'Pay cash after service completion' }
        ];

        for (const m of defaults) {
            await prisma.paymentMethod.create({ data: m });
        }

        methods = await prisma.paymentMethod.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
    }

    return successResponse(res, 'Payment methods retrieved', methods);
});

// Process a payment (Simulated)
export const processPayment = asyncHandler(async (req, res) => {
    const { bookingId, methodId, details } = req.body;

    if (!bookingId || !methodId) {
        throw createError.badRequest('Booking ID and Method ID are required');
    }

    const result = await paymentService.processMockPayment(bookingId, methodId, details || {});

    if (!result.success) {
        throw createError.paymentRequired(`Payment Failed: ${result.message}`);
    }

    return successResponse(res, 'Payment processed successfully', result);
});

export default {
    getMethods,
    processPayment
};
