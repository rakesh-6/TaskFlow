import express from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as taskController from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    import('express-validator').then(({ validationResult }) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        next();
    });
};

router.use(protect);

router
    .route('/')
    .get(projectController.getProjects)
    .post(
        [body('name').trim().notEmpty().withMessage('Project name is required')],
        validate,
        projectController.createProject
    );

router
    .route('/:id')
    .all(projectController.isMember)
    .get(projectController.getProject)
    .put(projectController.isAdmin, projectController.updateProject)
    .delete(projectController.isOwner, projectController.deleteProject);

router.post('/:id/archive', projectController.isMember, projectController.isAdmin, projectController.archiveProject);

// Member management
router.put('/:id/members', projectController.isMember, projectController.isAdmin, projectController.updateMemberRole);
router.delete('/:id/members/:userId', projectController.isMember, projectController.isAdmin, projectController.removeMember);

// Invitations (Project specific)
router.post(
    '/:id/invite',
    projectController.isMember,
    projectController.isAdmin,
    [body('email').isEmail().withMessage('Valid email required')],
    validate,
    projectController.inviteMember
);

// Global invite routes (no project ID needed for accept/details)
// These would normally go in an invite.routes.js but we mount them from index.js directly to /api/invites
router.get('/invites/:token', projectController.getInviteDetails);
router.post('/invites/:token/accept', projectController.acceptInvite);

// Activity
router.get('/:id/activity', projectController.isMember, projectController.getActivity);

// Task operations that need a project context
router
    .route('/:id/tasks')
    .all(projectController.isMember)
    .get(taskController.getTasks)
    .post(
        [body('title').trim().notEmpty().withMessage('Task title is required')],
        validate,
        taskController.createTask
    );

export default router;
