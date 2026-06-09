import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  vendorId: Types.ObjectId;
  vendorName: string;
  vendorAvatar?: string;
  title: string;
  content: string;
  images: string[];
  eventType?: string;
  likes: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, required: true },
    vendorAvatar: { type: String },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 2000 },
    images: { type: [String], default: [] },
    eventType: { type: String },
    likes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Post = model<IPost>('Post', postSchema);