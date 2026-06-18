import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined' | 'deposit_received' | 'deposit_confirmed' | 'deposit_rejected' | 'booking_completed' | 'review_received' | 'vendor_approved' | 'vendor_rejected' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['booking_request', 'booking_accepted', 'booking_declined', 'deposit_received', 'deposit_confirmed', 'deposit_rejected', 'booking_completed', 'review_received', 'vendor_approved', 'vendor_rejected', 'system'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    relatedId: { type: Schema.Types.ObjectId },
    relatedModel: { type: String }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
