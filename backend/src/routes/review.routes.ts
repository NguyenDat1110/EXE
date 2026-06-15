import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createReview, getVendorReviews, getBookingReview, replyToReview } from '../controllers/review.controller';

const router = Router();

router.post('/', authenticate as any, createReview as any);
router.get('/vendor/:vendorId', getVendorReviews as any);
router.get('/booking/:bookingId', authenticate as any, getBookingReview as any);
router.patch('/:reviewId/reply', authenticate as any, replyToReview as any);

export default router;
