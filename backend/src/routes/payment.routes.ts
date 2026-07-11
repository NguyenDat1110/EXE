import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  handlePayOSWebhook,
  createBookingDepositPayment,
  createBookingFinalPayment,
  createSubscriptionPayment,
  getPaymentStatus
} from '../controllers/payment.controller';

const router = Router();

// Webhook từ PayOS (không cần auth - xác thực bằng chữ ký checksum)
router.post('/payos-webhook', handlePayOSWebhook);

// Tạo link thanh toán
router.post('/booking/:id/deposit', authenticate as any, createBookingDepositPayment as any);
router.post('/booking/:id/final', authenticate as any, createBookingFinalPayment as any);
router.post('/subscription', authenticate as any, createSubscriptionPayment as any);

// Kiểm tra trạng thái giao dịch
router.get('/status/:orderCode', authenticate as any, getPaymentStatus as any);

export default router;
