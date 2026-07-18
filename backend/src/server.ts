import dotenv from 'dotenv';

// Load environment variables (phải chạy trước khi import các module dùng process.env)
dotenv.config();

import app from './app';
import connectDB from './config/db';
import { registerPayOSWebhook } from './services/payos.service';
import { SubscriptionPlan } from './models/subscriptionPlan.model';
import { Vendor } from './models/vendor.model';
import { createNotification } from './controllers/notification.controller';

const PORT = process.env.PORT || 5000;

const seedSubscriptionPlans = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count === 0) {
    await SubscriptionPlan.create([
      {
        name: 'Gói Thường',
        code: 'BASIC',
        type: 'basic',
        price: 0,
        durationMonths: 12,
        features: ['2D Images', 'Limited Posts', 'Basic Support'],
        isActive: true,
      },
      {
        name: 'Gói VIP',
        code: 'VIP',
        type: 'vip',
        price: 500000,
        durationMonths: 12,
        features: ['3D Images', '360 Viewer', 'Priority Search', 'Premium Support'],
        isActive: true,
      },
    ]);
    console.log('Default subscription plans seeded');
  }
};

// Cron: kiểm tra subscription hết hạn mỗi giờ
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    const expiredVendors = await Vendor.find({
      subscriptionStatus: 'active',
      subscriptionExpiry: { $lt: now },
    }).lean();

    if (expiredVendors.length === 0) return;

    const ids = expiredVendors.map(v => v._id);
    await Vendor.updateMany(
      { _id: { $in: ids } },
      { $set: { subscriptionStatus: 'expired' }, $unset: { subscriptionPlan: '' } }
    );

    for (const vendor of expiredVendors) {
      if (vendor.userId) {
        const planCode = vendor.subscriptionPlan || '';
        const planName = planCode
          ? (await SubscriptionPlan.findOne({ code: planCode }).lean())?.name || planCode
          : 'không xác định';
        await createNotification(
          String(vendor.userId),
          'system',
          'Gói dịch vụ đã hết hạn',
          `Gói "${planName}" của bạn đã hết hạn vào ${new Date(vendor.subscriptionExpiry!).toLocaleDateString('vi-VN')}. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.`,
          String(vendor._id),
          'Vendor'
        );
      }
    }

    console.log(`[Cron] Đã hết hạn ${expiredVendors.length} vendor`);
  } catch (err) {
    console.error('[Cron] Lỗi kiểm tra hết hạn:', err);
  }
};

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  await seedSubscriptionPlans();

  checkExpiredSubscriptions();
  setInterval(checkExpiredSubscriptions, 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Đăng ký webhook PayOS (nếu có PAYOS_WEBHOOK_URL, ví dụ URL ngrok)
    registerPayOSWebhook();
  });
};

startServer();
