import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Vendor } from '../models/vendor.model';

// Define subscription plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Gói Thường',
    price: 0, // Free or some amount
    duration: 365, // days
    features: ['2D Images', 'Limited Posts', 'Basic Support']
  },
  vip: {
    name: 'Gói VIP',
    price: 500000, // Vietnamese Dong
    duration: 365,
    features: ['3D Images', '360 Viewer', 'Priority Search', 'Premium Support']
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!plan || !['basic', 'vip'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Calculate expiry date (365 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].duration);

    vendor.subscriptionPlan = plan as 'basic' | 'vip';
    vendor.subscriptionExpiry = expiryDate;
    vendor.subscriptionStatus = 'active';

    await vendor.save();

    res.json({
      message: 'Subscription updated successfully',
      vendor: {
        subscriptionPlan: vendor.subscriptionPlan,
        subscriptionExpiry: vendor.subscriptionExpiry,
        subscriptionStatus: vendor.subscriptionStatus
      }
    });
  } catch (err) {
    console.error('Error updating subscription:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      subscriptionPlan: vendor.subscriptionPlan,
      subscriptionExpiry: vendor.subscriptionExpiry,
      subscriptionStatus: vendor.subscriptionStatus,
      hasActiveSubscription: vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > new Date()
    });
  } catch (err) {
    console.error('Error getting subscription status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
