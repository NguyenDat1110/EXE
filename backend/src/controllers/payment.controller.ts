import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';

// Interface for SePay Webhook Payload
interface SePayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: 'in' | 'out';
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description: string;
}

export const handleSePayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify API Token if configured
    const configuredToken = process.env.SEPAY_API_TOKEN;
    const authHeader = req.headers.authorization;
    
    // Simple verification (Bearer token)
    if (configuredToken && configuredToken !== 'YOUR_SEPAY_API_TOKEN') {
      if (!authHeader || authHeader !== `Bearer ${configuredToken}`) {
        res.status(401).json({ success: false, message: 'Unauthorized webhook' });
        return;
      }
    }

    const payload: SePayWebhookPayload = req.body;

    // Only process incoming transfers
    if (payload.transferType !== 'in') {
      res.status(200).json({ success: true, message: 'Ignored non-inward transfer' });
      return;
    }

    const content = payload.content.toUpperCase();
    const amount = payload.transferAmount;

    // Extract Booking ID from content. We expect syntax like "CP 668F1A" or "CP668F1A"
    // Assuming Booking ID suffix is the last 6 chars of MongoDB ObjectId
    const match = content.match(/CP\s*([A-F0-9]{6})/i);
    
    if (!match) {
      // Not a matching syntax, ignore
      res.status(200).json({ success: true, message: 'No matching syntax found' });
      return;
    }

    const bookingIdSuffix = match[1].toLowerCase();

    // Find the booking that has this suffix and is waiting for deposit
    // Fetch all pending/waiting_deposit bookings and filter in memory to avoid CastError with regex on ObjectId
    const activeBookings = await Booking.find({
      status: { $in: ['pending', 'waiting_deposit'] },
    });

    const booking = activeBookings.find(b => b._id.toString().toLowerCase().endsWith(bookingIdSuffix));

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found or already paid' });
      return;
    }

    // Verify amount (optional, can accept partial or require exact)
    // Here we check if transferAmount >= depositAmount
    if (amount >= booking.depositAmount) {
      // Update booking status
      booking.status = 'confirmed';
      booking.paymentStatus = 'deposit_paid';
      booking.depositPaidAt = new Date();
      await booking.save();
      
      console.log(`[SePay Webhook] Booking ${booking._id} confirmed with payment of ${amount}`);
    } else {
      console.log(`[SePay Webhook] Booking ${booking._id} received partial payment of ${amount} (required ${booking.depositAmount})`);
      // Could handle partial payment logic here
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('SePay Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
