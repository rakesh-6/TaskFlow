import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.model.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Authentication middleware for sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.user.name})`);

        // Users join a room with their user ID to receive direct notifications
        socket.on('join', (userId) => {
            // Security check: only allow joining own room
            if (socket.user._id.toString() === userId) {
                socket.join(userId);
                console.log(`User ${userId} joined their personal room`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
