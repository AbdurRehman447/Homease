import express from 'express';
import {
    getMyConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
} from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * @route GET /api/chat/conversations
 * @desc Get all conversations for the authenticated user/provider
 */
router.get('/conversations', getMyConversations);

/**
 * @route GET /api/chat/conversations/booking/:bookingId
 * @desc Get or create a conversation linked to a specific booking
 */
router.get('/conversations/booking/:bookingId', getOrCreateConversation);

/**
 * @route GET /api/chat/messages/:conversationId
 * @desc Get all messages for a specific conversation
 */
router.get('/messages/:conversationId', getMessages);

/**
 * @route POST /api/chat/messages
 * @desc Send a new message in a conversation
 */
router.post('/messages', sendMessage);

export default router;
