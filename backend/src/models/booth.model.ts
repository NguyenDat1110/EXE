import { Schema, model, Document, Types } from 'mongoose';

export type BoothEventType = 'TIỆC CƯỚI' | 'HỘI THẢO' | 'SINH NHẬT' | 'KỈ NIỆM';
export type BoothCategory = 'wedding' | 'seminar' | 'birthday' | 'anniversary';

export interface IBooth extends Document {
  vendorId: Types.ObjectId;
  name: string;
  category?: BoothCategory;
  eventType: BoothEventType;
  description: string;
  address?: string;
  coverImage?: string;
  gallery?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const boothSchema = new Schema<IBooth>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['wedding', 'seminar', 'birthday', 'anniversary'],
      required: false,
      index: true
    },
    eventType: {
      type: String,
      enum: ['TIỆC CƯỚI', 'HỘI THẢO', 'SINH NHẬT', 'KỈ NIỆM'],
      required: true
    },
    description: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    coverImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Booth = model<IBooth>('Booth', boothSchema);
