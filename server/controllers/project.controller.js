import crypto from 'crypto';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import Invite from '../models/Invite.model.js';
import { logActivity } from '../utils/activity.utils.js';
import { sendTeamInviteEmail } from '../utils/email.utils.js';

// ── Middlewares ─────────────────────────────────────────────────────────────
export const isMember = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const project = await Project.findById(projectId);

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isOwner = project.owner.equals(req.user._id);
        const memberObj = project.members.find((m) => m.user.equals(req.user._id));

        if (!isOwner && !memberObj) {
            return res.status(403).json({ message: 'Not authorized to access this project' });
        }

        req.project = project;
        req.memberRole = isOwner ? 'admin' : memberObj.role;
        next();
    } catch (error) {
        next(error);
    }
};

export const isAdmin = (req, res, next) => {
    if (req.memberRole !== 'admin') {
        return res.status(403).json({ message: 'Requires admin role for this project' });
    }
    next();
};

export const isOwner = (req, res, next) => {
    if (!req.project.owner.equals(req.user._id)) {
        return res.status(403).json({ message: 'Requires owner permissions' });
    }
    next();
};

// ── Controllers ─────────────────────────────────────────────────────────────

export const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({
            $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
        })
            .populate('owner', 'name avatar email')
            .populate('members.user', 'name avatar email')
            .sort({ createdAt: -1 });

        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

export const createProject = async (req, res, next) => {
    try {
        const project = await Project.create({
            ...req.body,
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'admin' }],
        });

        logActivity(req.user._id, project._id, 'created_project');

        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

export const getProject = async (req, res, next) => {
    try {
        // req.project is already fetched by isMember middleware
        const project = await Project.findById(req.project._id)
            .populate('owner', 'name avatar email')
            .populate('members.user', 'name avatar email');

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        const updated = await Project.findByIdAndUpdate(req.project._id, req.body, {
            new: true,
            runValidators: true,
        });

        logActivity(req.user._id, updated._id, 'updated_project');
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        await Project.findByIdAndDelete(req.project._id);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const archiveProject = async (req, res, next) => {
    try {
        req.project.status = 'archived';
        await req.project.save();

        logActivity(req.user._id, req.project._id, 'updated_project', { status: 'archived' });
        res.status(200).json(req.project);
    } catch (error) {
        next(error);
    }
};

// ── Member Management ────────────────────────────────────────────────────────

export const updateMemberRole = async (req, res, next) => {
    try {
        const { userId, role } = req.body;

        // Prevent changing owner's role
        if (req.project.owner.equals(userId)) {
            return res.status(400).json({ message: "Cannot change owner's role" });
        }

        const member = req.project.members.find((m) => m.user.equals(userId));
        if (!member) return res.status(404).json({ message: 'User is not a member of this project' });

        member.role = role;
        await req.project.save();

        res.status(200).json({ message: 'Role updated successfully', members: req.project.members });
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (req.project.owner.equals(userId)) {
            return res.status(400).json({ message: 'Cannot remove the project owner' });
        }

        req.project.members = req.project.members.filter((m) => !m.user.equals(userId));
        await req.project.save();

        logActivity(req.user._id, req.project._id, 'removed_member', { targetUserId: userId });

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        next(error);
    }
};

// ── Invite System ────────────────────────────────────────────────────────────

export const inviteMember = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if user is already a member
        const targetUser = await User.findOne({ email });
        if (targetUser && req.project.members.some((m) => m.user.equals(targetUser._id))) {
            return res.status(400).json({ message: 'User is already a project member' });
        }

        const unhashedToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');

        const invite = await Invite.create({
            email,
            project: req.project._id,
            token: hashedToken,
            invitedBy: req.user._id,
            expiresAt: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
        });

        await sendTeamInviteEmail(email, req.user.name, req.project.name, unhashedToken);

        res.status(200).json({ message: 'Invitation sent successfully', inviteId: invite._id });
    } catch (error) {
        next(error);
    }
};

export const getInviteDetails = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const invite = await Invite.findOne({
            token: hashedToken,
            status: 'pending',
            expiresAt: { $gt: Date.now() },
        }).populate('project', 'name description');

        if (!invite) return res.status(404).json({ message: 'Invalid or expired invitation' });

        res.status(200).json(invite);
    } catch (error) {
        next(error);
    }
};

export const acceptInvite = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const invite = await Invite.findOne({
            token: hashedToken,
            status: 'pending',
            expiresAt: { $gt: Date.now() },
        });

        if (!invite) return res.status(404).json({ message: 'Invalid or expired invitation' });

        // Ensure logged-in user matches invited email (or allow if required by business logic)
        // Assuming user must be logged in with the same email
        if (req.user.email !== invite.email) {
            return res.status(403).json({ message: 'This invitation was sent to a different email address' });
        }

        const project = await Project.findById(invite.project);
        if (!project) return res.status(404).json({ message: 'Project no longer exists' });

        // Add user as editor
        if (!project.members.some((m) => m.user.equals(req.user._id))) {
            project.members.push({ user: req.user._id, role: 'editor' });
            await project.save();
            logActivity(req.user._id, project._id, 'added_member', { targetUserId: req.user._id });
        }

        invite.status = 'accepted';
        await invite.save();

        res.status(200).json({ message: 'Invitation accepted successfully', projectId: project._id });
    } catch (error) {
        next(error);
    }
};

import Activity from '../models/Activity.model.js';

export const getActivity = async (req, res, next) => {
    try {
        const activity = await Activity.find({ project: req.project._id })
            .populate('user', 'name avatar')
            .populate('task', 'title status')
            .sort('-createdAt')
            .limit(50);

        res.status(200).json(activity);
    } catch (error) {
        next(error);
    }
};
