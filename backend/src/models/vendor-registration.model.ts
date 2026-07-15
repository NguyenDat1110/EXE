import { Schema, model, Document, Types } from 'mongoose';

export interface IVendorRegistration extends Document {
  userId: Types.ObjectId;
  companyName: string;
  taxId: string;
  companyAddress: string;
  businessLicense: string[];
  businessLicenseNames?: string[];
  phone: string;
  email: string;
  bio?: string;
  avatar?: string;
  website?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorRegistrationSchema = new Schema<IVendorRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, default: '' },
    taxId: { type: String, default: undefined, unique: true, sparse: true },
    companyAddress: { type: String, default: '' },
    businessLicense: { type: [String], default: [] },
    businessLicenseNames: { type: [String], default: [] },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    bio: { type: String, maxlength: 300 },
    avatar: { type: String },
    website: { type: String },
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationReason: { type: String },
  },
  { timestamps: true }
);

export const VendorRegistration = model<IVendorRegistration>(
  'VendorRegistration',
  vendorRegistrationSchema
);
