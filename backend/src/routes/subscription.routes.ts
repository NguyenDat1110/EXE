import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { updateSubscription, getSubscriptionStatus, reactivateSubscription } from '../controllers/subscription.controller';
import { SubscriptionPlan } from '../models/subscriptionPlan.model';

const router = Router();

// Get all available subscription plans from DB
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await SubscriptionPlan.find()
      .sort({ price: 1 })
      .lean()
      .then(docs =>
        docs.map(plan => ({
          name: plan.name,
          code: plan.code,
          type: plan.type,
          price: plan.price,
          duration: (plan.durationMonths || 1) * 30,
          features: plan.features,
          isActive: plan.isActive,
          _id: plan._id,
        }))
      );

    res.json({ plans });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
});

// Update vendor subscription
router.post('/update', authenticate as any, updateSubscription as any);

// Get vendor subscription status
router.get('/status', authenticate as any, getSubscriptionStatus as any);

// Reactivate a previously purchased plan
router.post('/reactivate', authenticate as any, reactivateSubscription as any);

export default router;
