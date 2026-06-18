import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  vendorId: Types.ObjectId;
  rating: number;
  comment?: string;
  vendorReply?: string;
  vendorRepliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    vendorReply: { type: String },
    vendorRepliedAt: { type: Date }
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
