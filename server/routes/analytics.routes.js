import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard', getDashboardAnalytics);

export default router;
