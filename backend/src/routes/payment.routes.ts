import { Router } from 'express';
import { handleSePayWebhook } from '../controllers/payment.controller';

const router = Router();

// Route for SePay Webhook
router.post('/sepay-webhook', handleSePayWebhook);

export default router;
