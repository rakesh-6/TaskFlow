import express from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    import('express-validator').then(({ validationResult }) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }
        next();
    });
};

// Rate limiting for auth routes (10 req / 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// ── Local Auth ────────────────────────────────────────────────────────
router.post(
    '/register',
    authLimiter,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    validate,
    authController.register
);

router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    authController.login
);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

router.get('/verify-email/:token', authController.verifyEmail);

router.post(
    '/forgot-password',
    authLimiter,
    [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
    validate,
    authController.forgotPassword
);

router.post(
    '/reset-password/:token',
    [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
    validate,
    authController.resetPassword
);

// ── OAuth Auth ────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleOAuthCallback
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    authController.githubOAuthCallback
);

export default router;
