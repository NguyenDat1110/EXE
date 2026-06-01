import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import {
  createBooking,
  getBookingById,
  getMyBookings,
  getVendorBookings,
  getVendorAvailability,
  acceptBooking,
  declineBooking,
  payDeposit,
  vendorConfirmDeposit,
  vendorRejectDeposit,
  cancelBooking,
  markVendorComplete,
  confirmCustomerComplete,
  payFinalBalance
} from '../controllers/booking.controller';

const router = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate as any, createBooking as any);
router.get('/my', authenticate as any, getMyBookings as any);
router.get('/vendor/me', authenticate as any, getVendorBookings as any);
router.get('/vendor/:vendorId/availability', getVendorAvailability as any);
router.get('/:id', authenticate as any, getBookingById as any);
router.post('/:id/accept', authenticate as any, acceptBooking as any);
router.post('/:id/decline', authenticate as any, declineBooking as any);
router.post('/:id/pay-deposit', authenticate as any, upload.single('receipt'), payDeposit as any);
router.post('/:id/confirm-deposit', authenticate as any, vendorConfirmDeposit as any);
router.post('/:id/reject-deposit', authenticate as any, vendorRejectDeposit as any);
router.post('/:id/cancel', authenticate as any, cancelBooking as any);
router.post('/:id/vendor-complete', authenticate as any, markVendorComplete as any);
router.post('/:id/customer-complete', authenticate as any, confirmCustomerComplete as any);
router.post('/:id/pay-final-balance', authenticate as any, upload.single('receipt'), payFinalBalance as any);

export default router;
