import prisma from '../config/database.js';
import { createError } from '../utils/ApiError.js';
import { successResponse, createdResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitNewMessage, getIO } from '../services/socket.service.js';

/**
 * Get or create a conversation for a specific booking
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { userId, role } = req.user;

    // Find booking
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            customer: { select: { id: true, name: true, avatar: true } },
            provider: { select: { id: true, name: true, avatar: true } },
        },
    });

    if (!booking) {
        throw createError.notFound('Booking not found');
    }

    // Check if user is part of the booking
    if (role === 'CUSTOMER' && booking.customerId !== userId) {
        throw createError.forbidden('You are not authorized to access this chat');
    }
    if (role === 'PROVIDER' && booking.providerId !== userId) {
        throw createError.forbidden('You are not authorized to access this chat');
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
        where: { bookingId },
        include: {
            customer: { select: { id: true, name: true, avatar: true } },
            provider: { select: { id: true, name: true, avatar: true } },
            booking: { select: { id: true, serviceName: true, status: true, bookingNumber: true } }
        },
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                bookingId,
                customerId: booking.customerId,
                providerId: booking.providerId,
            },
            include: {
                customer: { select: { id: true, name: true, avatar: true } },
                provider: { select: { id: true, name: true, avatar: true } },
                booking: { select: { id: true, serviceName: true, status: true, bookingNumber: true } }
            },
        });
    }

    return successResponse(res, 'Conversation retrieved successfully', conversation);
});

/**
 * Get messages for a conversation
 */
export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { userId, role } = req.user;

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });

    if (!conversation) {
        throw createError.notFound('Conversation not found');
    }

    // Check authorization
    if (role === 'CUSTOMER' && conversation.customerId !== userId) {
        throw createError.forbidden('You are not authorized to view these messages');
    }
    if (role === 'PROVIDER' && conversation.providerId !== userId) {
        throw createError.forbidden('You are not authorized to view these messages');
    }

    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
    });

    // Mark incoming messages as read
    await prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
        },
        data: { isRead: true },
    });

    return successResponse(res, 'Messages retrieved successfully', messages);
});

/**
 * Send a new message
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, text, type = 'TEXT', fileUrl, metadata } = req.body;
    const { userId, role } = req.user;

    if (type === 'TEXT' && (!text || text.trim() === '')) {
        throw createError.badRequest('Message text is required for text messages');
    }

    if (type === 'IMAGE' && !fileUrl) {
        throw createError.badRequest('File URL is required for image messages');
    }

    if (type === 'LOCATION' && !metadata) {
        throw createError.badRequest('Location metadata is required');
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });

    if (!conversation) {
        throw createError.notFound('Conversation not found');
    }

    // Check authorization
    if (role === 'CUSTOMER' && conversation.customerId !== userId) {
        throw createError.forbidden('You are not authorized to send messages in this chat');
    }
    if (role === 'PROVIDER' && conversation.providerId !== userId) {
        throw createError.forbidden('You are not authorized to send messages in this chat');
    }

    // Create message
    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId: userId,
            senderType: role,
            text,
            type,
            fileUrl,
            metadata: metadata || undefined,
        },
    });

    // Update last message in conversation
    let lastMsgDisplay = text;
    if (type === 'IMAGE') lastMsgDisplay = '📷 Image';
    if (type === 'LOCATION') lastMsgDisplay = '📍 Location shared';

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            lastMessage: lastMsgDisplay,
            lastMessageAt: new Date(),
        },
    });

    // Emit to socket room for real-time delivery
    emitNewMessage(conversationId, message);

    // Also emit to individual user rooms for global notifications
    const io = getIO();
    io.to(`user_${conversation.customerId}`).emit('new_global_message', { conversationId, message });
    io.to(`user_${conversation.providerId}`).emit('new_global_message', { conversationId, message });

    return createdResponse(res, 'Message sent successfully', message);
});

/**
 * Get all conversations for current user/provider
 */
export const getMyConversations = asyncHandler(async (req, res) => {
    const { userId, role } = req.user;

    const where = role === 'PROVIDER' ? { providerId: userId } : { customerId: userId };

    const conversations = await prisma.conversation.findMany({
        where,
        include: {
            customer: { select: { id: true, name: true, avatar: true } },
            provider: { select: { id: true, name: true, avatar: true } },
            booking: { select: { id: true, serviceName: true, status: true, bookingNumber: true } },
            _count: {
                select: {
                    messages: {
                        where: {
                            senderId: { not: userId },
                            isRead: false
                        }
                    }
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
    });

    return successResponse(res, 'Conversations retrieved successfully', conversations);
});

export default {
    getOrCreateConversation,
    getMessages,
    sendMessage,
    getMyConversations,
};
