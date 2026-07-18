import { Schema, model, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  code: string;
  type: 'basic' | 'vip';
  price: number;
  durationMonths: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['basic', 'vip'], required: true },
    price: { type: Number, required: true },
    durationMonths: { type: Number, required: true, default: 1 },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const SubscriptionPlan = model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
