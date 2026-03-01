import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.io server
 * @param {import('http').Server} server - The HTTP server instance
 */
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        // console.log('Socket: User connected:', socket.id);

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            // console.log(`Socket: User ${socket.id} joined conversation: ${conversationId}`);
        });

        // Join a global user room for notifications
        socket.on('join_user', (userId) => {
            socket.join(`user_${userId}`);
            // console.log(`Socket: User ${socket.id} joined user room: user_${userId}`);
        });

        // Handle leaving a room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
            // console.log(`Socket: User ${socket.id} left conversation: ${conversationId}`);
        });

        // Handle typing status
        socket.on('typing', ({ conversationId, userId, userName }) => {
            socket.to(conversationId).emit('user_typing', { userId, userName });
        });

        socket.on('stop_typing', ({ conversationId, userId }) => {
            socket.to(conversationId).emit('user_stop_typing', { userId });
        });

        socket.on('disconnect', () => {
            // console.log('Socket: User disconnected:', socket.id);
        });
    });

    return io;
};

/**
 * Get the initialized Socket.io instance
 * @returns {Server}
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Emit a new message to a specific conversation room
 * @param {string} conversationId 
 * @param {object} message 
 */
export const emitNewMessage = (conversationId, message) => {
    if (io) {
        io.to(conversationId).emit('new_message', message);
    }
};

export default {
    initSocket,
    getIO,
    emitNewMessage
};
