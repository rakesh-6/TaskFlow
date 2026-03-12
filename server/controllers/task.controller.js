import Task from '../models/Task.model.js';
import Notification from '../models/Notification.model.js';
import { logActivity } from '../utils/activity.utils.js';
import { getIO } from '../socket.js';

export const getTasks = async (req, res, next) => {
    try {
        const projectId = req.project._id;
        const { status, priority, assignee, q, page = 1, limit = 20, sort = '-createdAt' } = req.query;

        const query = { project: projectId };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignee) query.assignee = assignee;

        // Text Search
        if (q) {
            query.$text = { $search: q };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Apply sort logic (if text searching, use textscore by default)
        let sortConfig = sort;
        if (q && !req.query.sort) {
            sortConfig = { score: { $meta: 'textScore' } };
        }

        const tasks = await Task.find(query)
            .populate('assignee', 'name avatar email')
            .populate('createdBy', 'name avatar email')
            .populate('comments.author', 'name avatar')
            .sort(sortConfig)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        res.status(200).json({
            tasks,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const project = req.project;

        // Optional: Only allow project members to be assigned
        if (req.body.assignee && !project.members.some(m => m.user.equals(req.body.assignee))) {
            return res.status(400).json({ message: 'Assignee must be a project member' });
        }

        const task = await Task.create({
            ...req.body,
            project: project._id,
            createdBy: req.user._id,
        });

        logActivity(req.user._id, project._id, 'created_task', {}, task._id);

        // Notification
        if (task.assignee && !task.assignee.equals(req.user._id)) {
            const notif = await Notification.create({
                user: task.assignee,
                type: 'task_assigned',
                message: `${req.user.name} assigned you to a task: ${task.title}`,
                link: `/projects/${project._id}?task=${task._id}`
            });
            // Emit via Socket.io
            try {
                getIO().to(task.assignee.toString()).emit('notification', notif);
            } catch (err) {
                console.error('Socket emission failed:', err.message);
            }
        }

        // Populate for response
        const populated = await Task.findById(task._id)
            .populate('assignee', 'name avatar email')
            .populate('createdBy', 'name avatar email');

        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, project: req.project._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const prevStatus = task.status;
        Object.assign(task, req.body);

        await task.save();

        if (task.status === 'done' && prevStatus !== 'done') {
            logActivity(req.user._id, req.project._id, 'completed_task', {}, task._id);
        } else {
            logActivity(req.user._id, req.project._id, 'updated_task', { fields: Object.keys(req.body) }, task._id);
        }

        const populated = await Task.findById(task._id)
            .populate('assignee', 'name avatar email')
            .populate('createdBy', 'name avatar email');

        res.status(200).json(populated);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, project: req.project._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        logActivity(req.user._id, req.project._id, 'deleted_task', { taskTitle: task.title });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req, res, next) => {
    try {
        const { status, order } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, project: req.project._id },
            { status, order },
            { new: true }
        )
            .populate('assignee', 'name avatar email')
            .populate('createdBy', 'name avatar email');

        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (status === 'done') {
            logActivity(req.user._id, req.project._id, 'completed_task', {}, task._id);
        }

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

export const addComment = async (req, res, next) => {
    try {
        const { content } = req.body;
        const task = await Task.findOne({ _id: req.params.id, project: req.project._id });

        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.comments.push({
            author: req.user._id,
            content,
        });

        await task.save();

        logActivity(req.user._id, req.project._id, 'commented', { commentContent: content }, task._id);

        // Notify task creator
        if (!task.createdBy.equals(req.user._id)) {
            const notif = await Notification.create({
                user: task.createdBy,
                type: 'comment',
                message: `${req.user.name} commented on your task: ${task.title}`,
                link: `/projects/${req.project._id}?task=${task._id}`
            });
            try {
                getIO().to(task.createdBy.toString()).emit('notification', notif);
            } catch (err) {
                console.error('Socket emission failed:', err.message);
            }
        }

        const populated = await Task.findById(task._id).populate('comments.author', 'name avatar');
        res.status(201).json(populated.comments);
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, project: req.project._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const comment = task.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Only comment author or project admin can delete
        if (!comment.author.equals(req.user._id) && req.memberRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        comment.deleteOne();
        await task.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        next(error);
    }
};

import { uploadToCloudinary } from '../middleware/upload.middleware.js';

export const addAttachment = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, project: req.project._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        const result = await uploadToCloudinary(req.file.buffer, 'taskflow/attachments');

        task.attachments.push({
            name: req.file.originalname,
            url: result.secure_url,
        });

        await task.save();

        logActivity(req.user._id, req.project._id, 'updated_task', { attachmentAdded: req.file.originalname }, task._id);

        res.status(200).json(task.attachments);
    } catch (error) {
        next(error);
    }
};
