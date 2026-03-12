import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'expired'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export default mongoose.model('Invite', inviteSchema);
