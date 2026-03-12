import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';
dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadAttachment = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Utility function to upload buffer stream to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'taskflow') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete failed:', error);
    }
};
