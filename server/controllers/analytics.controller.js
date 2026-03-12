import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';
import mongoose from 'mongoose';

export const getDashboardAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Fast counts
        const totalProjects = await Project.countDocuments({
            $or: [{ owner: userId }, { 'members.user': userId }],
        });

        // Find all projects the user is in to filter tasks
        const projects = await Project.find({
            $or: [{ owner: userId }, { 'members.user': userId }],
        }).select('_id');
        const projectIds = projects.map((p) => p._id);

        // Aggregate task stats
        const taskStats = await Task.aggregate([
            { $match: { project: { $in: projectIds } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Format for charting
        const formattedTaskStats = {
            todo: 0,
            'in-progress': 0,
            'in-review': 0,
            done: 0,
        };

        taskStats.forEach((stat) => {
            if (formattedTaskStats[stat._id] !== undefined) {
                formattedTaskStats[stat._id] = stat.count;
            }
        });

        const completionRate = formattedTaskStats.done /
            (formattedTaskStats.todo + formattedTaskStats['in-progress'] + formattedTaskStats['in-review'] + formattedTaskStats.done) || 0;

        res.status(200).json({
            totalProjects,
            totalTasks: taskStats.reduce((acc, curr) => acc + curr.count, 0),
            taskStats: formattedTaskStats,
            completionRate: (completionRate * 100).toFixed(1),
        });
    } catch (error) {
        next(error);
    }
};
