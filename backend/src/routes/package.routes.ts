import { Router } from 'express';
import {
	createPackage,
	updatePackage,
	togglePackageVisibility,
	getVendorPackages,
	deletePackage,
	getPublicPackage
} from '../controllers/package.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate as any, createPackage as any);
router.get('/', authenticate as any, getVendorPackages as any);
router.get('/public/:id', getPublicPackage as any);
router.patch('/:id', authenticate as any, updatePackage as any);
router.patch('/:id/toggle', authenticate as any, togglePackageVisibility as any);
router.delete('/:id', authenticate as any, deletePackage as any);

export default router;
