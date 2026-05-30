import { Schema, model, Document, Types } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  guestMin: number;
  guestMax: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendor extends Document {
  userId: Types.ObjectId;
  companyName: string;
  taxId: string;
  companyAddress: string;
  businessLicense: string;
  phone: string;
  email: string;
  bio?: string;
  avatar?: string;
  website?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationReason?: string;
  averageRating: number;
  reviewCount: number;
  totalBookings: number;
  packages: IPackage[];
  subscriptionPlan?: 'basic' | 'vip';
  subscriptionExpiry?: Date;
  subscriptionStatus?: 'active' | 'expired' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    priceMin: { type: Number, required: true },
    priceMax: { type: Number, required: true },
    guestMin: { type: Number, required: true },
    guestMax: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const vendorSchema = new Schema<IVendor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, default: '' },
    taxId: { type: String, default: undefined, unique: true, sparse: true },
    companyAddress: { type: String, default: '' },
    businessLicense: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    bio: { type: String, maxlength: 300 },
    avatar: { type: String },
    website: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verificationReason: { type: String },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    packages: [packageSchema],
    subscriptionPlan: { type: String, enum: ['basic', 'vip'], default: undefined },
    subscriptionExpiry: { type: Date },
    subscriptionStatus: { type: String, enum: ['active', 'expired', 'inactive'], default: 'inactive' }
  },
  { timestamps: true }
);

export const Vendor = model<IVendor>('Vendor', vendorSchema);
