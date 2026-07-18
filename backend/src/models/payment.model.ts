import { Schema, model, Document, Types } from 'mongoose';

export type PaymentType = 'booking_deposit' | 'booking_final' | 'subscription';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface IPayment extends Document {
  orderCode: number;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  userId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  subscriptionPlan?: string;
  description?: string;
  checkoutUrl?: string;
  paymentLinkId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderCode: { type: Number, required: true, unique: true, index: true },
    type: { type: String, enum: ['booking_deposit', 'booking_final', 'subscription'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    subscriptionPlan: { type: String },
    description: { type: String, default: '' },
    checkoutUrl: { type: String, default: '' },
    paymentLinkId: { type: String, default: '' },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
