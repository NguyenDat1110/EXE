import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    isEmailVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
