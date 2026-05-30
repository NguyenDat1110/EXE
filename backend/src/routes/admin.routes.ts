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

export default router;
