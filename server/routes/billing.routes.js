import express from 'express';
import { body } from 'express-validator';
import * as billingController from '../controllers/billing.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// The webhook needs the raw body to verify signatures. Note that in index.js we MUST
// ensure this route is registered BEFORE express.json() is applied globally if not carefully scoped.
// For now, we use express.raw({type: 'application/json'}) just for the webhook route in index.js mapping 
// but since the prompt says "register BEFORE express.json()", we'll assume index.js is set up to pass raw buffer here.
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    billingController.handleWebhook
);

// Require auth for checkout and portal
router.post(
    '/checkout',
    protect,
    [body('priceId').notEmpty().withMessage('Price ID is required')],
    (req, res, next) => import('express-validator').then(({ validationResult }) => {
        if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req).array() });
        next();
    }),
    billingController.createCheckoutSession
);

router.post('/portal', protect, billingController.createPortalSession);

export default router;
