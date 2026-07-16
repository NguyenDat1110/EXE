import { Router } from 'express';
import {
  submitVendorInfo,
  getVendorInfo,
  getVendorRegistrationInfo,
  updateVendorProfile,
  uploadVendorLicense,
  blockDate,
  unblockDate,
  getVendorStats,
} from '../controllers/vendor.controller';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const router = Router();

router.post('/submit-info', authenticate as any, submitVendorInfo as any);
router.get('/registration/info', authenticate as any, getVendorRegistrationInfo as any);
router.post('/profile/update', authenticate as any, updateVendorProfile as any);
router.get('/info', authenticate as any, getVendorInfo as any);
router.post('/upload-license', authenticate as any, upload.single('file'), uploadVendorLicense as any);
router.post('/block-date', authenticate as any, blockDate as any);
router.delete('/block-date', authenticate as any, unblockDate as any);
router.get('/stats', authenticate as any, getVendorStats as any);

export default router;
