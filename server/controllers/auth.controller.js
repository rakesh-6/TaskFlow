import crypto from 'crypto';
import User from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.utils.js';

// Helper for cookies
const setTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const user = new User({ name, email, password });

        // Generate verify token
        const verifyToken = crypto.randomBytes(32).toString('hex');
        user.verifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');

        // Tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshTokens.push(refreshToken);

        await user.save();

        // Send email without awaiting, to not block the request
        sendVerificationEmail(user.email, verifyToken).catch((err) =>
            console.error('Email send failed:', err)
        );

        setTokenCookie(res, refreshToken);

        res.status(201).json({
            accessToken,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push(refreshToken);
        user.lastLogin = Date.now();
        await user.save();

        setTokenCookie(res, refreshToken);

        res.status(200).json({
            accessToken,
            user,
        });
    } catch (error) {
        next(error);
    }
};

import jwt from 'jsonwebtoken';

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Not authorized, no refresh token' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Check if token exists in user's refreshTokens array
        const tokenIndex = user.refreshTokens.indexOf(refreshToken);
        if (tokenIndex === -1) {
            // Possible token reuse / compromised. Clear all tokens
            user.refreshTokens = [];
            await user.save();
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }

        // Remove old token from array
        user.refreshTokens.splice(tokenIndex, 1);

        // Generate new tokens (rotation)
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push(newRefreshToken);
        await user.save();

        setTokenCookie(res, newRefreshToken);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const user = await User.findOne({ refreshTokens: refreshToken });
            if (user) {
                user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
                await user.save();
            }
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ verifyToken: hashedToken });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verifyToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return the same message to prevent email enumeration
        const message = 'If that email exists, we sent a reset link.';

        if (!user) {
            return res.status(200).json({ message });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();

        sendPasswordResetEmail(user.email, resetToken).catch((err) =>
            console.error('Email send failed:', err)
        );

        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password; // Pre-save hook will hash it
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        // Log out of all devices by clearing refresh tokens
        user.refreshTokens = [];
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

// Next steps: Add OAuth controllers for Google and GitHub
export const githubOAuthCallback = async (req, res) => {
    // handled by passport, but a successful redirect is needed
    const accessToken = generateAccessToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
};

export const googleOAuthCallback = async (req, res) => {
    const accessToken = generateAccessToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
};
