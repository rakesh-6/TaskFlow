import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 6,
        },
        avatar: {
            type: String,
        },
        avatarPublicId: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        plan: {
            type: String,
            enum: ['free', 'pro', 'team'],
            default: 'free',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifyToken: String,
        resetToken: String,
        resetTokenExpiry: Date,
        refreshTokens: [String],
        stripeCustomerId: String,
        lastLogin: Date,
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields in JSON response
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshTokens;
    delete user.verifyToken;
    delete user.resetToken;
    return user;
};

export default mongoose.model('User', userSchema);
