import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'review' | 'payment';
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['booking', 'system', 'review', 'payment'], default: 'system' },
    isRead: { type: Boolean, default: false },
    link: { type: String }
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);
