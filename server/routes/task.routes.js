import express from 'express';
import { body } from 'express-validator';
import * as taskController from '../controllers/task.controller.js';
import * as projectController from '../controllers/project.controller.js'; // Needed just for isMember middleware checking
import { protect } from '../middleware/auth.middleware.js';
import { uploadAttachment } from '../middleware/upload.middleware.js';

const router = express.Router();

// Extractor middleware to fetch project context for tasks (tasks are bound to projects)
const requireTaskProjectMember = async (req, res, next) => {
    try {
        const mongoose = (await import('mongoose')).default;
        const task = await mongoose.model('Task').findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        req.params.id = String(task.project);
        // Trick: call isMember middleware to verify access, then restore the param
        const originalId = req.params.id;
        projectController.isMember(req, res, (err) => {
            req.params.id = req.originalUrl.split('/')[3]; // restore the task ID manually, or passed by state
            if (err) return next(err);
            next();
        });
    } catch (error) {
        next(error);
    }
};

router.use(protect);
router.use('/:id', requireTaskProjectMember); // Every specific task route verifies project access

router.patch(
    '/:id/status',
    [
        body('status').isIn(['todo', 'in-progress', 'in-review', 'done']).withMessage('Invalid status'),
        body('order').isNumeric().withMessage('Order must be numeric'),
    ],
    (req, res, next) => import('express-validator').then(({ validationResult }) => {
        if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req).array() });
        next();
    }),
    taskController.updateTaskStatus
);

router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

router.post(
    '/:id/comments',
    [body('content').trim().notEmpty().withMessage('Comment cannot be empty')],
    (req, res, next) => import('express-validator').then(({ validationResult }) => {
        if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req).array() });
        next();
    }),
    taskController.addComment
);

router.delete('/:id/comments/:commentId', taskController.deleteComment);

router.post(
    '/:id/attachments',
    uploadAttachment.single('file'),
    taskController.addAttachment
);

export default router;
