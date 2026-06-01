import { Router } from 'express';
import { submitVendorInfo, getVendorInfo, uploadVendorLicense } from '../controllers/vendor.controller';
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
router.get('/info', authenticate as any, getVendorInfo as any);
router.post('/upload-license', authenticate as any, upload.single('file'), uploadVendorLicense as any);

export default router;
