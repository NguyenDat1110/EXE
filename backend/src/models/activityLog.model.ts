import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  adminId: Types.ObjectId; // The admin who performed the action
  action: string; // e.g., 'approve_vendor', 'lock_user', 'update_subscription'
  targetId?: string; // ID of the affected resource
  targetModel?: string; // e.g., 'Vendor', 'User', 'SubscriptionPlan'
  details: any; // Additional payload or changes
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetId: { type: String },
    targetModel: { type: String },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
