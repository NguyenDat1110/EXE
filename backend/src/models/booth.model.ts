import { Schema, model, Document, Types } from 'mongoose';

export type BoothEventType = 'TIỆC CƯỚI' | 'HỘI THẢO' | 'SINH NHẬT' | 'KỈ NIỆM';

export interface IBooth extends Document {
  vendorId: Types.ObjectId;
  name: string;
  eventType: BoothEventType;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const boothSchema = new Schema<IBooth>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true, trim: true },
    eventType: {
      type: String,
      enum: ['TIỆC CƯỚI', 'HỘI THẢO', 'SINH NHẬT', 'KỈ NIỆM'],
      required: true
    },
    description: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Booth = model<IBooth>('Booth', boothSchema);
