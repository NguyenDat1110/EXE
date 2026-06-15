import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';

const router = Router();

router.use(authenticate as any);

router.get('/', getNotifications as any);
router.patch('/mark-all-read', markAllAsRead as any);
router.patch('/:notificationId/read', markAsRead as any);

export default router;
