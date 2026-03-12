import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    import('express-validator').then(({ validationResult }) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        next();
    });
};

router.use(protect);

router.get('/me', userController.getMe);

router.put(
    '/profile',
    [body('name').trim().notEmpty().withMessage('Name cannot be empty')],
    validate,
    userController.updateProfile
);

router.put('/avatar', uploadAvatar.single('file'), userController.uploadAvatar);

export default router;
