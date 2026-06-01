import { Schema, model, Document, Types } from 'mongoose';

export interface IPackage extends Document {
  boothId: Types.ObjectId;
  vendorId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  includedServices: string[];
  minParticipants: number;
  maxParticipants: number;
  depositAmount: number;
  serviceDuration: string;
  images: string[];
  model3dUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    boothId: { type: Schema.Types.ObjectId, ref: 'Booth', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    includedServices: [{ type: String }],
    minParticipants: { type: Number, default: 0 },
    maxParticipants: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    serviceDuration: { type: String, default: '' },
    images: [{ type: String }],
    model3dUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Package = model<IPackage>('Package', packageSchema);
