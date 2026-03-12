import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        color: {
            type: String,
            default: '#6366f1',
        },
        status: {
            type: String,
            enum: ['active', 'archived'],
            default: 'active',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                role: {
                    type: String,
                    enum: ['viewer', 'editor', 'admin'],
                    default: 'editor',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        dueDate: {
            type: Date,
        },
        tags: [
            {
                type: String,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
