import { Router } from 'express';
import { submitVendorInfo, getVendorInfo } from '../controllers/vendor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/submit-info', authenticate as any, submitVendorInfo as any);
router.get('/info', authenticate as any, getVendorInfo as any);

export default router;
