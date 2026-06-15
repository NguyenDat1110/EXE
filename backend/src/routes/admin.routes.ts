import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  lockUser,
  unlockUser,
  getUserDetail,
  getPendingVendors,
  approveVendor,
  rejectVendor
} from '../controllers/admin.controller';
import {
  getAllPackages,
  togglePackageStatus,
  getReports,
  updateReportStatus,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  updateVendorSubscription,
  getActivityLogs
} from '../controllers/admin.extended.controller';
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

// UC-39: Package management
router.get('/packages', getAllPackages as any);
router.patch('/packages/:vendorId/:packageId/status', togglePackageStatus as any);

// UC-40: Complaint/Report management
router.get('/reports', getReports as any);
router.patch('/reports/:reportId/status', updateReportStatus as any);

// UC-41: Subscription plan management
router.get('/subscriptions/plans', getSubscriptionPlans as any);
router.post('/subscriptions/plans', createSubscriptionPlan as any);
router.put('/subscriptions/plans/:planId', updateSubscriptionPlan as any);

// UC-43: Vendor subscription manual management
router.post('/vendors/:vendorId/subscription', updateVendorSubscription as any);

// UC-42: System activity logs
router.get('/logs', getActivityLogs as any);

export default router;
