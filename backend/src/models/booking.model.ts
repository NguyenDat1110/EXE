import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  customerId: Types.ObjectId;
  vendorId: Types.ObjectId;
  packageId?: string;
  eventDate: Date;
  numberOfGuests: number;
  specialRequests?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  bookingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    packageId: { type: String },
    eventDate: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    specialRequests: { type: String },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    bookingDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Booking = model<IBooking>('Booking', bookingSchema);
