import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  reporterId: Types.ObjectId; // User who created the report
  targetId: Types.ObjectId; // Vendor or Post or Booking that is reported
  targetModel: 'Vendor' | 'Post' | 'Booking';
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetModel: { type: String, enum: ['Vendor', 'Post', 'Booking'], required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
    adminNotes: { type: String }
  },
  { timestamps: true }
);

export const Report = model<IReport>('Report', reportSchema);
