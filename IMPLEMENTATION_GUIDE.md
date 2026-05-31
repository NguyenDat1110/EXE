# EventFlow - UC-06, UC-09, UC-34 Implementation Guide

## Tổng Quan

Các tài liệu này hướng dẫn cài đặt và sử dụng 3 use case:
- **UC-06**: Cập nhật thông tin cá nhân (Update Personal Information)
- **UC-09**: Admin duyệt hồ sơ Vendor (Admin Vendor Approval)
- **UC-34**: Gửi email thông báo (Email Notifications)

---

## Backend Setup

### 1. Cài đặt Dependencies

Đã cài đặt trong `backend/package.json`:
- `nodemailer`: Gửi email qua SMTP

```bash
npm install
```

### 2. Cấu hình Environment Variables

Cập nhật file `backend/.env`:

```env
# Existing variables
MONGO_URI="mongodb+srv://ntd11102004:11102004@exe.wz9avhq.mongodb.net/clickpick?retryWrites=true&w=majority&appName=EXE"
PORT=5000
JWT_SECRET=clickpick_super_secret_key_123456

# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="EventFlow <noreply@eventflow.com>"

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### 3. Gmail SMTP Setup

Để sử dụng Gmail:

1. Bật Two-Factor Authentication trong tài khoản Google
2. Tạo App Password:
   - Đi tới https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Windows Computer" (hoặc thiết bị của bạn)
   - Sao chép password được cấp
   - Dán vào `EMAIL_PASSWORD` trong `.env`

### 4. API Endpoints

#### UC-06: Update Profile

**Endpoint**: `PATCH /api/auth/profile`

**Headers**: 
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "name": "Tên người dùng",
  "phone": "0901234567",
  "avatar": "https://cloudinary-url-to-image.jpg"
}
```

**Response**:
```json
{
  "message": "Cập nhật thông tin cá nhân thành công!",
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "phone": "...",
    "avatar": "...",
    "role": "customer"
  }
}
```

#### UC-09: Get Pending Vendors

**Endpoint**: `GET /api/admin/vendors?status=pending&page=1&limit=10`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Lấy danh sách vendor thành công",
  "data": [
    {
      "_id": "...",
      "companyName": "...",
      "email": "...",
      "taxId": "...",
      "companyAddress": "...",
      "businessLicense": "...",
      "phone": "...",
      "verificationStatus": "pending",
      "createdAt": "2024-..."
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### UC-09: Approve Vendor

**Endpoint**: `PATCH /api/admin/vendors/:vendorId/approve`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response**: Gửi email phê duyệt
```json
{
  "message": "Phê duyệt vendor thành công!",
  "data": { ... }
}
```

#### UC-09: Reject Vendor

**Endpoint**: `PATCH /api/admin/vendors/:vendorId/reject`

**Headers**: 
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "reason": "Giấy phép không hợp lệ"
}
```

**Response**: Gửi email từ chối với lý do
```json
{
  "message": "Từ chối vendor thành công!",
  "data": { ... }
}
```

---

## Frontend Setup

### 1. Cài đặt Cloudinary

#### 1.1 Tạo tài khoản Cloudinary
- Đi tới https://cloudinary.com
- Đăng ký tài khoản miễn phí
- Lấy `Cloud Name` từ dashboard

#### 1.2 Tạo Upload Preset
1. Đi tới Settings → Upload tab
2. Tạo Upload Preset mới (không cần authentication)
3. Lưu tên preset

#### 1.3 Cấu hình Environment

Cập nhật `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 2. Feature: Upload Avatar

**File Components**:
- `src/services/cloudinary.ts` - Upload service
- `src/pages/profile/CustomerProfile.tsx` - Customer avatar upload
- `src/pages/profile/VendorProfile.tsx` - Vendor avatar upload

**Usage**:
1. Click upload icon on avatar
2. Select image (JPG, PNG, WebP, GIF)
3. Max 5MB file size
4. Image automatically optimized (400x400, quality 85)
5. Profile updated in real-time

### 3. Feature: Admin Vendor Approval

**File Components**:
- `src/services/adminApi.ts` - Admin API calls
- `src/components/admin-dashboard/VerificationQueue.tsx` - Approval UI

**Features**:
- ✅ Real API integration (removed mock data)
- ✅ Tab filtering (Pending, Approved, Rejected)
- ✅ Vendor detail modal
- ✅ Approve/Reject with reason
- ✅ Auto-email notifications
- ✅ Real-time updates

---

## Email Templates

### Email được gửi tự động:

1. **Vendor Approval Email**
   - Gửi khi admin phê duyệt vendor
   - Chứa link đến vendor dashboard
   - Template: `src/services/email.service.ts` → `sendVendorApprovalEmail()`

2. **Vendor Rejection Email**
   - Gửi khi admin từ chối vendor
   - Chứa lý do từ chối
   - Template: `src/services/email.service.ts` → `sendVendorRejectionEmail()`

3. **Password Reset Email**
   - Gửi khi user yêu cầu reset password
   - Chứa link reset (expires trong 1 giờ)
   - Template: `src/services/email.service.ts` → `sendPasswordResetEmail()`

---

## Flow Từ Booking Đến Đánh Giá

### 1. Chọn gian hàng và gói dịch vụ
- Người dùng vào `/explore`, lọc theo loại sự kiện.
- Mở chi tiết gian hàng ở `/booths/:boothId` để xem:
  - Thông tin vendor công khai
  - Danh sách package
  - Giá, tiền cọc, thời lượng
  - Số khách tối thiểu/tối đa của package
- Chọn package rồi bấm **Đặt lịch ngay** để vào trang booking.

### 2. Tạo booking
- Ở trang **Đặt Lịch Dịch Vụ**, người dùng chọn:
  - Ngày tổ chức trên calendar
  - Số khách nhập trực tiếp
  - Giờ bắt đầu
  - Địa chỉ tổ chức
  - Ghi chú thêm nếu cần
- Frontend gọi `POST /api/bookings`.
- Backend tạo booking mới với:
  - `status = pending`
  - `paymentStatus = unpaid`
  - Lưu `eventDate`, `startTime`, `eventStartAt`, `numberOfGuests`, `totalPrice`

### 3. Vendor duyệt booking
- Vendor vào trang danh sách booking để xem đơn mới.
- Nếu duyệt, booking chuyển sang `waiting_deposit`.
- Nếu từ chối, booking chuyển sang `cancelled`.

### 4. Khách thanh toán cọc
- Khách vào trang **Đơn Đặt Chỗ Của Tôi**.
- Với booking ở trạng thái `waiting_deposit`, khách bấm **Thanh toán cọc**.
- Hệ thống cho phép tải biên lai lên.
- Backend lưu file vào `uploads/receipts` và cập nhật:
  - `paymentStatus = deposit_pending`
  - `depositReceiptUrl`

### 5. Vendor xác nhận hoặc từ chối biên lai cọc
- Vendor kiểm tra biên lai.
- Nếu xác nhận:
  - `paymentStatus = deposit_paid`
  - `status = confirmed`
  - `depositPaidAt` được ghi nhận
- Nếu từ chối:
  - `paymentStatus = deposit_rejected`
  - Lưu lý do từ chối vào `depositRejectedReason`

### 6. Hoàn thành dịch vụ
- Khi đến thời điểm hợp lệ, vendor có thể đánh dấu booking là `vendor_completed`.
- Khách sau đó xác nhận đã hoàn thành để chuyển booking sang `customer_completed`.
- Nếu còn phần thanh toán cuối, khách gửi biên lai phần còn lại.
- Sau khi thanh toán đủ, booking chuyển sang `completed`.

### 7. Đánh giá
- Hiện tại codebase **chưa có API hoặc form gửi review thật** sau khi booking hoàn tất.
- Hệ thống chỉ đang hiển thị:
  - `averageRating`
  - `reviewCount`
- Các số này được lấy từ vendor profile và hiển thị ở booth detail / vendor profile.
- Nếu team muốn có review thật, cần bổ sung:
  - Review model
  - API tạo review sau `completed`
  - UI nhập sao + nhận xét ở customer side

---

## Cách Chạy Dự Án

### Backend
1. Vào thư mục `backend`.
2. Chạy cài đặt dependency:

```bash
npm install
```

3. Cấu hình file `backend/.env` theo mẫu sau:

```env
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>/clickpick?retryWrites=true&w=majority&appName=EXE"
PORT=5000
JWT_SECRET=<your-jwt-secret>

EMAIL_SERVICE=gmail
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM="EventFlow <noreply@eventflow.com>"

FRONTEND_URL=http://localhost:5173
```

4. Chạy backend:

```bash
npm run dev
```

### Frontend
1. Vào thư mục `frontend`.
2. Cài đặt dependency:

```bash
npm install
```

3. Đảm bảo frontend dùng API backend local, thường là `VITE_API_URL=http://localhost:5000/api`.
4. Chạy frontend:

```bash
npm run dev
```

### Mở Ứng Dụng
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

### Lưu Ý Khi Test Luồng Booking
- Cần có dữ liệu MongoDB sẵn: vendor, booth, package.
- Package phải có `minParticipants` và `maxParticipants` để hiển thị đúng ở booking form.
- Muốn test cọc/hoàn tiền cần file biên lai ảnh hoặc PDF.
- Trạng thái lịch ngày bị bận lấy từ booking đã tồn tại của vendor.

---

## Testing

### Test UC-06: Update Profile

```bash
# 1. Login
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "password123"
}

# 2. Get token từ response

# 3. Update profile
PATCH /api/auth/profile
Header: Authorization: Bearer <token>
{
  "name": "Tên mới",
  "phone": "0987654321",
  "avatar": "https://cloudinary-url.jpg"
}
```

### Test UC-09: Vendor Approval

```bash
# 1. Login as Admin
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# 2. Get pending vendors
GET /api/admin/vendors?status=pending

# 3. Approve vendor
PATCH /api/admin/vendors/{vendorId}/approve

# 4. Check email (vendor should receive approval email)

# 5. Reject vendor
PATCH /api/admin/vendors/{vendorId}/reject
{
  "reason": "Tài liệu không hợp lệ"
}

# 6. Check email (vendor should receive rejection email)
```

---

## Troubleshooting

### Email không gửi

1. **Check Gmail credentials**
   - Kiểm tra EMAIL_USER và EMAIL_PASSWORD đúng
   - Verify App Password từ Google Account

2. **Check Email logs**
   ```bash
   # Backend console sẽ in:
   # "Email sent successfully to vendor@example.com"
   # hoặc
   # "Error sending email: ..."
   ```

3. **Disable Firewall**
   - Kiểm tra firewall không block port 587 (Gmail SMTP)

### Cloudinary không upload

1. **Check credentials**
   - Verify VITE_CLOUDINARY_CLOUD_NAME
   - Verify VITE_CLOUDINARY_UPLOAD_PRESET

2. **Check file size**
   - Max 5MB
   - Supported: JPG, PNG, WebP, GIF

3. **Browser console errors**
   - Check DevTools → Network tab → CloudinaryAPI response

### API 404 errors

1. Đảm bảo backend đang chạy: `npm run dev`
2. Đảm bảo VITE_API_URL trong frontend/.env đúng
3. Check CORS headers trong backend

---

## Database Fields

### User Model

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string; // NEW - Cloudinary URL
  role: 'customer' | 'vendor' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vendor Model

```typescript
interface IVendor {
  _id: ObjectId;
  userId: ObjectId;
  companyName: string;
  taxId: string;
  companyAddress: string;
  businessLicense: string;
  phone: string;
  email: string;
  bio?: string;
  avatar?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationReason?: string; // NEW - Lý do từ chối
  // ... other fields
}
```

---

## Next Steps

### Còn cần implement:
- [ ] Password reset endpoint
- [ ] Email verification
- [ ] 2FA (Two-Factor Authentication)
- [ ] Rate limiting for API
- [ ] Error logging service

### Optional Enhancements:
- [ ] Batch vendor approval
- [ ] Email retry mechanism
- [ ] Image compression before upload
- [ ] Admin email notification dashboard
- [ ] Vendor registration status tracking page

---

## Support

Nếu gặp vấn đề:
1. Check backend logs: `npm run dev` output
2. Check frontend console: DevTools F12
3. Verify .env files có tất cả required variables
4. Restart backend server
5. Clear browser cache: Ctrl+Shift+Delete
