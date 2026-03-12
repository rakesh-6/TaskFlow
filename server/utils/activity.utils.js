import Activity from '../models/Activity.model.js';

/**
 * Creates an Activity record asynchronously to not block the main request thread.
 */
export const logActivity = (userId, projectId, action, meta = {}, taskId = null) => {
    try {
        const activity = new Activity({
            user: userId,
            project: projectId,
            action: action,
            meta: meta,
            ...(taskId && { task: taskId }),
        });

        activity.save().catch(err => {
            console.error('Failed to log activity:', err.message);
        });
    } catch (error) {
        console.error('Failed to instantiate activity:', error.message);
    }
};
