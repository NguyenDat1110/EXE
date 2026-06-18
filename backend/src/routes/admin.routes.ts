import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  lockUser,
  unlockUser,
  getUserDetail,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getActivityLogs,
  adminGetSubscriptions,
  adminExtendSubscription,
  adminRevokeSubscription
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// UC-37: Dashboard stats
router.get('/dashboard', getDashboardStats as any);

// UC-38: User management
router.get('/users', getAllUsers as any);
router.get('/users/:userId', getUserDetail as any);
router.post('/users/:userId/lock', lockUser as any);
router.post('/users/:userId/unlock', unlockUser as any);

// UC-09: Vendor verification
router.get('/vendors', getPendingVendors as any);
router.patch('/vendors/:vendorId/approve', approveVendor as any);
router.patch('/vendors/:vendorId/reject', rejectVendor as any);

// UC-42: Activity logs
router.get('/logs', getActivityLogs as any);

// UC-41: Subscription management
router.get('/subscriptions', adminGetSubscriptions as any);

// UC-43: Extend/revoke subscription
router.post('/vendors/:vendorId/extend-subscription', adminExtendSubscription as any);
router.post('/vendors/:vendorId/revoke-subscription', adminRevokeSubscription as any);

export default router;
