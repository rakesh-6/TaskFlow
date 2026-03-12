import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'in-review', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dueDate: {
            type: Date,
        },
        order: {
            type: Number,
            default: 0,
        },
        labels: [String],
        attachments: [
            {
                name: String,
                url: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        comments: [
            {
                author: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                content: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Task', taskSchema);
