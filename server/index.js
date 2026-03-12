import 'dotenv/config';
import dns from 'dns';

// Force Node.js to use Google & Cloudflare DNS to bypass local ISP/Hotspot blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import './config/passport.js';
import { initSocket } from './socket.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import billingRoutes from './routes/billing.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();
const server = http.createServer(app);

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize()); // Prevent NoSQL injections

// Rate limiting: max 300 requests per 15 mins per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
// NOTE: Stripe webhook route needs raw body — register BEFORE express.json()
// (wired in billing.routes.js directly)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check (UptimeRobot keep-alive) ────────────────────────────────────
app.get('/ping', (_req, res) => res.json({ status: 'ok' }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        ...(err.code && { code: err.code }),
        ...(err.errors && { errors: err.errors }),
    });
});

// ── Database + Start Server ───────────────────────────────────────────────────
initSocket(server);

import { initCronJobs } from './utils/cron.utils.js';
initCronJobs();

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });

export { server };
