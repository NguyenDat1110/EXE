import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Vendor } from '../models/vendor.model';
import { SubscriptionPlan } from '../models/subscriptionPlan.model';

// Kích hoạt gói cho vendor - dùng chung cho gói miễn phí và webhook PayOS sau khi thanh toán thành công
export const activateVendorSubscription = async (vendorId: unknown, planCode: string) => {
  const [vendor, planDoc] = await Promise.all([
    Vendor.findById(vendorId),
    SubscriptionPlan.findOne({
      $or: [{ code: planCode }, { type: planCode }],
      isActive: true
    }).lean(),
  ]);

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  if (!planDoc) {
    throw new Error('Subscription plan not found');
  }

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + planDoc.durationMonths);

  vendor.subscriptionPlan = planDoc.code;
  vendor.subscriptionExpiry = expiryDate;
  vendor.subscriptionStatus = 'active';

  // Track purchase history
  if (!vendor.purchasedSubscriptions) vendor.purchasedSubscriptions = [];
  const existing = vendor.purchasedSubscriptions.find(s => s.planCode === planDoc.code);
  if (existing) {
    existing.expiryAt = expiryDate;
  } else {
    vendor.purchasedSubscriptions.push({
      planCode: planDoc.code,
      planName: planDoc.name,
      planType: planDoc.type,
      purchasedAt: new Date(),
      expiryAt: expiryDate,
    });
  }

  await vendor.save();
  return vendor;
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    const planDoc = await SubscriptionPlan.findOne({ code: plan, isActive: true }).lean();
    if (!planDoc) {
      return res.status(400).json({ message: 'Gói dịch vụ không tồn tại' });
    }

    // Gói trả phí phải thanh toán qua PayOS (POST /api/payment/subscription)
    if (planDoc.price > 0) {
      return res.status(400).json({ message: 'Gói trả phí cần được thanh toán qua PayOS. Vui lòng sử dụng luồng thanh toán.' });
    }

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Only approved vendors may purchase/activate subscriptions
    if (vendor.verificationStatus !== 'approved') {
      return res.status(403).json({ message: 'Hồ sơ doanh nghiệp chưa được phê duyệt. Không thể mua gói.' });
    }

    // If vendor already has an active subscription for the same plan and it's not expired, block repurchase
    const now = new Date();
    if (vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > now) {
      if (vendor.subscriptionPlan === plan) {
        return res.status(400).json({ message: 'Bạn đã có gói này đang hoạt động. Không thể mua lại trước khi hết hạn.' });
      }
    }

    const updatedVendor = await activateVendorSubscription(vendor._id, plan);

    res.json({
      message: 'Subscription updated successfully',
      vendor: {
        subscriptionPlan: updatedVendor.subscriptionPlan,
        subscriptionExpiry: updatedVendor.subscriptionExpiry,
        subscriptionStatus: updatedVendor.subscriptionStatus
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

export const reactivateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Find purchased subscription record
    const sub = vendor.purchasedSubscriptions?.find(s => s.planCode === plan);
    if (!sub) {
      return res.status(400).json({ message: 'Gói chưa từng được mua' });
    }

    const now = new Date();
    if (sub.expiryAt <= now) {
      return res.status(400).json({ message: 'Gói đã hết hạn, không thể kích hoạt lại' });
    }

    // Don't allow reactivating the currently active plan
    if (vendor.subscriptionPlan === plan && vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > now) {
      return res.status(400).json({ message: 'Gói này đang hoạt động' });
    }

    vendor.subscriptionPlan = sub.planCode;
    vendor.subscriptionExpiry = sub.expiryAt;
    vendor.subscriptionStatus = 'active';

    await vendor.save();

    res.json({
      message: 'Kích hoạt lại gói thành công',
      vendor: {
        subscriptionPlan: vendor.subscriptionPlan,
        subscriptionExpiry: vendor.subscriptionExpiry,
        subscriptionStatus: vendor.subscriptionStatus
      }
    });
  } catch (err) {
    console.error('Error reactivating subscription:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
