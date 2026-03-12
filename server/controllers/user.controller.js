import User from '../models/User.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.middleware.js';

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password -refreshTokens -verifyToken -resetToken');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image provided' });

        const user = await User.findById(req.user._id);

        // Delete old avatar if it exists
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        // Upload to Cloudinary with transformation (resize 200x200, crop fill)
        const result = await uploadToCloudinary(req.file.buffer, 'taskflow/avatars');

        user.avatar = result.secure_url;
        user.avatarPublicId = result.public_id;
        await user.save();

        res.status(200).json({ avatar: user.avatar });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user._id);
        if (name) user.name = name;

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
