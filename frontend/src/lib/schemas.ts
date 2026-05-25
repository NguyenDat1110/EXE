import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
  role: z.enum(['customer', 'vendor', 'admin']),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerStep1Schema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'vendor', 'admin']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;

export const registerStep2CustomerSchema = z.object({
  avatar: z.string().optional(),
  dateOfBirth: z.string().optional(),
  city: z.string().optional(),
});

export type RegisterStep2CustomerData = z.infer<typeof registerStep2CustomerSchema>;

export const registerStep2VendorSchema = z.object({
  companyName: z.string().min(2, 'Tên công ty là bắt buộc'),
  taxId: z.string().min(1, 'Mã số thuế là bắt buộc'),
  companyAddress: z.string().min(5, 'Địa chỉ là bắt buộc'),
  businessLicense: z.string().min(1, 'Giấy phép kinh doanh là bắt buộc'),
  bio: z.string().max(300, 'Tối đa 300 ký tự').optional(),
});

export type RegisterStep2VendorData = z.infer<typeof registerStep2VendorSchema>;
