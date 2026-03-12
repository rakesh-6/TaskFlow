import cron from 'node-cron';
import Task from '../models/Task.model.js';
import Notification from '../models/Notification.model.js';
import { getIO } from '../socket.js';

// Run every day at 8:00 AM
export const initCronJobs = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily task deadline checks...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            const startOfTomorrow = new Date(tomorrow);
            startOfTomorrow.setHours(0, 0, 0, 0);

            const dueSoonTasks = await Task.find({
                status: { $ne: 'done' },
                dueDate: {
                    $gte: startOfTomorrow,
                    $lte: tomorrow,
                },
            });

            for (const task of dueSoonTasks) {
                if (task.assignee) {
                    const notif = await Notification.create({
                        user: task.assignee,
                        type: 'due_soon',
                        message: `Task "${task.title}" is due tomorrow.`,
                        link: `/projects/${task.project}?task=${task._id}`,
                    });

                    try {
                        getIO().to(task.assignee.toString()).emit('notification', notif);
                    } catch (err) {
                        // Ignore socket errors here
                    }
                }
            }
        } catch (error) {
            console.error('Error in daily cron job:', error);
        }
    });
};
