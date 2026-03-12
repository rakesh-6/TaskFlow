import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res
                    .status(401)
                    .json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } catch (error) {
        next(error);
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: 'Not authorized, insufficient role' });
        }
        next();
    };
};

export const requirePlan = (...plans) => {
    return (req, res, next) => {
        if (!req.user || !plans.includes(req.user.plan)) {
            return res.status(403).json({
                message: 'This feature is not available on your current plan',
                code: 'PLAN_UPGRADE_REQUIRED'
            });
        }
        next();
    };
};
