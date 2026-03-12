import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
        action: {
            type: String,
            enum: [
                'created_project',
                'updated_project',
                'created_task',
                'updated_task',
                'completed_task',
                'deleted_task',
                'added_member',
                'removed_member',
                'commented',
            ],
            required: true,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
