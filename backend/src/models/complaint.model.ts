import { Schema, model, Document, Types } from 'mongoose';

export interface IComplaint extends Document {
  customerId: Types.ObjectId;
  vendorId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  adminNote?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open', index: true },
    adminNote: { type: String, default: '' },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const Complaint = model<IComplaint>('Complaint', complaintSchema);
