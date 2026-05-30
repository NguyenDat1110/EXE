import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { updateSubscription, getSubscriptionStatus, SUBSCRIPTION_PLANS } from '../controllers/subscription.controller';

const router = Router();

// Get all available subscription plans
router.get('/plans', (req, res) => {
  res.json({ plans: SUBSCRIPTION_PLANS });
});

// Update vendor subscription
router.post('/update', authenticate as any, updateSubscription as any);

// Get vendor subscription status
router.get('/status', authenticate as any, getSubscriptionStatus as any);

export default router;
