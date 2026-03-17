# 🧪 Mock Test Accounts

## Test Credentials

Use these credentials to log in to the CLICKPICK application:

### 👤 Customer Account #1

- **Email**: `customer@test.com`
- **Password**: `123456`
- **Role**: Customer
- **Name**: Nguyễn Văn A
- **Features**: View bookings, save vendors, manage profile

### 👥 Customer Account #2

- **Email**: `john@test.com`
- **Password**: `123456`
- **Role**: Customer
- **Name**: John Doe
- **Features**: View bookings, save vendors, manage profile

### 🏢 Vendor Account #1

- **Email**: `vendor@test.com`
- **Password**: `123456`
- **Role**: Vendor
- **Company**: Công ty Sự kiện Starlight
- **Features**: Manage packages, portfolio, bookings, statistics

### 🏢 Vendor Account #2

- **Email**: `duong@test.com`
- **Password**: `123456`
- **Role**: Vendor
- **Company**: Đường Events & Catering
- **Features**: Manage packages, portfolio, bookings, statistics

### 👨‍💼 Admin Account

- **Email**: `admin@test.com`
- **Password**: `123456`
- **Role**: Admin
- **Name**: Admin Manager
- **Features**: Dashboard, vendor approval, transaction monitoring

---

## How to Use

1. Click **[Đăng Nhập]** button in the navbar
2. Select your role (Customer, Vendor, or Admin)
3. Enter any email and password from the list above
4. Click **[Đăng Nhập]**
5. Wait 1.5 seconds for mock authentication
6. You'll be redirected to your dashboard based on your role:
   - **Customer** → Home page
   - **Vendor** → Vendor dashboard
   - **Admin** → Admin dashboard

---

## Mock User Details

### Customer Profile (customer@test.com)

- Name: Nguyễn Văn A
- Phone: 0987654321
- Birth Date: May 15, 1990
- City: Ho Chi Minh
- Address: 123 Nguyễn Huệ

### Vendor Profile (vendor@test.com)

- Company: Công ty Sự kiện Starlight
- Tax ID: 0123456789
- Address: 456 Lê Lợi, Q.1, TP.HCM
- Phone: 0912345678
- Bio: Chúng tôi chuyên tổ chức các sự kiện corporate, tiệc cưới, sinh nhật với chất lượng cao nhất.
- Status: Active
- Rating: 4.8★ (256 reviews)

### Vendor Profile (duong@test.com)

- Company: Đường Events & Catering
- Tax ID: 9876543210
- Address: 321 Tân Cảng, Q.Bình Thạnh, TP.HCM
- Phone: 0933333333
- Bio: Dịch vụ catering chuyên nghiệp cho các sự kiện lớn với đội bếp chuyên sâu.
- Status: Active
- Rating: 4.8★ (256 reviews)

---

## Features to Test

### For Customers

- ✅ Login with customer account
- ✅ View customer profile
- ✅ Edit personal information
- ✅ Change password
- ✅ View booking history (placeholder)
- ✅ Save favorite vendors (placeholder)
- ✅ Logout

### For Vendors

- ✅ Login with vendor account
- ✅ View vendor profile
- ✅ Edit company information
- ✅ Manage portfolio (upload/delete images)
- ✅ View reviews and ratings
- ✅ View business statistics
- ✅ Logout

### For Admin

- ✅ Login with admin account
- ✅ View admin dashboard
- ✅ Manage transactions
- ✅ Monitor verifications
- ✅ Logout

---

## Notes

- All accounts use password: `123456`
- Mock authentication has a 1.5-second delay to simulate real authentication
- All data is stored in browser localStorage (cleared when you logout)
- To reset all data, click logout and log back in
- These are test accounts only - use real backend integration for production

---

**Last Updated**: March 9, 2026  
**Version**: 1.0.0
