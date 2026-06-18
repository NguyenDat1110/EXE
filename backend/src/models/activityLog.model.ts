import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
<<<<<<< HEAD
  adminId: Types.ObjectId; // The admin who performed the action
  action: string; // e.g., 'approve_vendor', 'lock_user', 'update_subscription'
  targetId?: string; // ID of the affected resource
  targetModel?: string; // e.g., 'Vendor', 'User', 'SubscriptionPlan'
  details: any; // Additional payload or changes
  createdAt: Date;
  updatedAt: Date;
=======
  userId?: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
>>>>>>> 2c2104e232045224b0df3fdfd9e1d16ab542c5f5
}

const activityLogSchema = new Schema<IActivityLog>(
  {
<<<<<<< HEAD
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetId: { type: String },
    targetModel: { type: String },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

=======
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true, versionKey: false }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

>>>>>>> 2c2104e232045224b0df3fdfd9e1d16ab542c5f5
export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
