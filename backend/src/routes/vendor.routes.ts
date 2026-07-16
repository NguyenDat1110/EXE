import { Router } from 'express';
import {
  submitVendorInfo,
  getVendorInfo,
  getVendorRegistrationInfo,
  updateVendorProfile,
  blockDate,
  unblockDate,
  getVendorStats,
} from '../controllers/vendor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/submit-info', authenticate as any, submitVendorInfo as any);
router.get('/registration/info', authenticate as any, getVendorRegistrationInfo as any);
router.post('/profile/update', authenticate as any, updateVendorProfile as any);
router.get('/info', authenticate as any, getVendorInfo as any);
router.post('/block-date', authenticate as any, blockDate as any);
router.delete('/block-date', authenticate as any, unblockDate as any);
router.get('/stats', authenticate as any, getVendorStats as any);

export default router;
