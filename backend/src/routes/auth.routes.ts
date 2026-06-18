import { Router } from 'express';
import { register, login, getMe, updateProfile, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate as any, getMe as any);
router.patch('/profile', authenticate as any, updateProfile as any);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/change-password', authenticate as any, changePassword as any);

export default router;
