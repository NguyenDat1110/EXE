import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  customerId: Types.ObjectId;
  vendorId: Types.ObjectId;
  boothId?: Types.ObjectId;
  packageId?: Types.ObjectId;
  eventDate: Date;
  eventAddress?: string;
  startTime?: string;
  eventStartAt?: Date;
  numberOfGuests: number;
  specialRequests?: string;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  serviceDurationMinutes: number;
  status: 'pending' | 'waiting_deposit' | 'confirmed' | 'vendor_completed' | 'customer_completed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'deposit_pending' | 'deposit_rejected' | 'deposit_paid' | 'final_paid' | 'refunded';
  depositPaidAt?: Date;
  depositReceiptUrl?: string;
  depositRejectedAt?: Date;
  depositRejectedReason?: string;
  vendorCompletedAt?: Date;
  customerCompletedAt?: Date;
  finalPaidAt?: Date;
  finalReceiptUrl?: string;
  isReviewed?: boolean;
  bookingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    boothId: { type: Schema.Types.ObjectId, ref: 'Booth' },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
    eventDate: { type: Date, required: true },
    eventAddress: { type: String, default: '' },
    startTime: { type: String, default: '' },
    eventStartAt: { type: Date },
    numberOfGuests: { type: Number, required: true, min: 1 },
    specialRequests: { type: String },
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    serviceDurationMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'waiting_deposit', 'confirmed', 'vendor_completed', 'customer_completed', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'deposit_pending', 'deposit_rejected', 'deposit_paid', 'final_paid', 'refunded'], default: 'unpaid' },
    depositPaidAt: { type: Date },
    depositReceiptUrl: { type: String },
    depositRejectedAt: { type: Date },
    depositRejectedReason: { type: String, default: '' },
    vendorCompletedAt: { type: Date },
    customerCompletedAt: { type: Date },
    finalPaidAt: { type: Date },
    finalReceiptUrl: { type: String },
    isReviewed: { type: Boolean, default: false },
    bookingDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Booking = model<IBooking>('Booking', bookingSchema);
