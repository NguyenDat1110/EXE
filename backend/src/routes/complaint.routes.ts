import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createComplaint, getMyComplaints, adminGetComplaints, adminUpdateComplaint } from '../controllers/complaint.controller';

const router = Router();
router.use(authenticate as any);

router.post('/', createComplaint as any);
router.get('/my', getMyComplaints as any);
router.get('/admin', adminGetComplaints as any);
router.patch('/admin/:id', adminUpdateComplaint as any);

export default router;
