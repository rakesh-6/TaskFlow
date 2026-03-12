import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['task_assigned', 'comment', 'member_added', 'due_soon'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
