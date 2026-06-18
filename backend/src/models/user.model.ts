import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  role: 'customer' | 'vendor' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
