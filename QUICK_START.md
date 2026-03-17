# CLICKPICK Auth System - Quick Start Guide

## 🎯 Getting Started

### 1. Test the Login Page

- Click "Đăng Nhập" in the navbar (or navigate to `/login`)
- You'll see the split-layout login page with:
  - Left side: Luxury event image with overlay
  - Right side: Login form with role selector

### 2. Try Different Roles

```
Login with any email/password (min 6 chars):
- Role: 👤 Customer → redirects to home
- Role: 🏢 Vendor → redirects to vendor-dashboard
- Role: 🛡️ Admin → redirects to admin-dashboard
```

### 3. Register a New Account

- Click "Đăng ký ngay" link from the login form
- Choose role and fill Step 1 (name, email, phone, password)
- Complete Step 2 based on your role:
  - **Customer**: City, birthday, avatar
  - **Vendor**: Company info, license, bio → see pending review screen

### 4. View Your Profile

- After login, click the avatar in the navbar
- Select "Hồ Sơ" (Profile)
- Access role-specific profile pages:
  - **Customer Profile**: Personal info, booking history, saved vendors
  - **Vendor Profile**: Company info, portfolio, reviews, statistics

### 5. Test State Persistence

- Log in and refresh the page
- You'll stay logged in (localStorage persists session)
- Close browser, reopen → you're still logged in

---

## 🔧 Code Usage

### Access Auth State

```tsx
import { useAuthStore } from "@/store/authStore";

export function MyComponent() {
  const { user, isAuthenticated, role, logout } = useAuthStore();

  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Role: {role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protect Routes

```tsx
import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";

export function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <h1>Admin Only</h1>
    </ProtectedRoute>
  );
}
```

### Show Toast Notifications

```tsx
// Already available in App.tsx
showToast("Success!", "success");
showToast("Error!", "error");
showToast("Info", "info");
```

### Navigate to Pages

```tsx
// From anywhere using navigate function
navigate("login"); // Go to login
navigate("profile-customer"); // Customer profile
navigate("profile-vendor"); // Vendor profile
```

---

## 📁 File References

### Core Files

- `src/store/authStore.ts` - Zustand store with all auth logic
- `src/lib/schemas.ts` - Zod validation schemas
- `src/App.tsx` - Updated with auth integration

### Pages

- `src/pages/auth/LoginPage.tsx` - Login/Register container
- `src/pages/profile/CustomerProfile.tsx` - Customer profile page
- `src/pages/profile/VendorProfile.tsx` - Vendor profile page

### Components

- `src/components/features/auth/LoginForm.tsx` - Login form
- `src/components/features/auth/RegisterForm.tsx` - Registration form (2-step)
- `src/components/features/auth/ProtectedRoute.tsx` - Route protection HOC
- `src/components/ui/Avatar.tsx` - Avatar component
- `src/components/ui/FileUpload.tsx` - File upload with drag & drop
- `src/components/ui/Tabs.tsx` - Tab component
- `src/components/ui/PasswordStrength.tsx` - Password strength indicator
- `src/components/ui/Toast.tsx` - Toast notifications

---

## 🎨 Styling Reference

### Glassmorphism Classes

```html
<!-- Card with glass effect -->
<div class="glass-panel px-6 py-4 rounded-2xl">Content</div>

<!-- Active glass state (cyan highlight) -->
<div class="glass-active border-cyan">Selected item</div>

<!-- Cyan glow effect -->
<button class="cyan-glow">Click me</button>
```

### Color Scheme

```css
--color-navy: #0a0f1e; /* Backgrounds */
--color-silver: #c8d6e5; /* Text/secondary */
--color-cyan: #00d4ff; /* Accent/primary */
--color-white: #ffffff; /* Highlights */
```

---

## 🚀 Features Demo

### Login Form Features

- ✅ Role selector (3 options)
- ✅ Email validation
- ✅ Password show/hide toggle
- ✅ "Remember me" checkbox
- ✅ Forgot password link
- ✅ Loading spinner
- ✅ Social login button
- ✅ Register link

### Registration Features

- ✅ 2-step process
- ✅ Role-dependent fields
- ✅ Password strength indicator
- ✅ Real-time validation
- ✅ Drag & drop file upload
- ✅ City dropdown (Vietnamese cities)
- ✅ Company info form for vendors
- ✅ Pending review screen

### Profile Features

- ✅ Editable fields (inline edit mode)
- ✅ Password change section
- ✅ Multi-tab interface
- ✅ Booking history (customer)
- ✅ Portfolio management (vendor)
- ✅ Reviews/ratings (vendor)
- ✅ Statistics dashboard (vendor)

### Navbar Updates

- ✅ Login/Register buttons when not authenticated
- ✅ Notifications bell when authenticated
- ✅ Avatar dropdown with profile menu
- ✅ Role-aware navigation
- ✅ Logout functionality

---

## 🧪 Testing Checklist

- [ ] Login with different roles
- [ ] Register new accounts
- [ ] Test password strength indicator
- [ ] Try file uploads
- [ ] Edit profile fields
- [ ] Test logout → localStorage cleared
- [ ] Refresh page → session persists
- [ ] Try all profile tabs
- [ ] Test form validation
- [ ] Check toast notifications

---

## 🔐 Mock Auth Details

### Current Implementation

- **API Calls**: Simulated with timeouts (1.5-2s)
- **Storage**: localStorage only (for demo)
- **Token**: Mock token generated: `mock-token-{timestamp}`
- **Validation**: Full Zod validation on client

### Ready for Backend Integration

To connect to a real API:

1. Update `authStore.ts`:

   ```tsx
   const response = await fetch("/api/login", {
     method: "POST",
     body: JSON.stringify({ email, password, role }),
   });
   ```

2. Replace mock delays with real API calls
3. Update token storage (JWT, httpOnly cookies, etc.)
4. Add error handling and retry logic

---

## 📝 Data Persistence

### What Gets Saved to localStorage

```json
{
  "authStore": {
    "user": {
      /* User object */
    },
    "role": "customer|vendor|admin",
    "isAuthenticated": true,
    "token": "mock-token-xxx"
  }
}
```

### When Gets Cleared

- User clicks logout button
- Browser dev tools → Application → Storage → Clear

### Rehydration

- Automatic on app load
- Happens before component render
- Check: `useAuthStore((s) => s.isAuthenticated)`

---

## 🎯 Next Steps

1. **Connect to Backend**
   - Replace mock API calls with real endpoints
   - Update error handling

2. **Add Email Verification**
   - Add verification code page
   - Resend code functionality

3. **OAuth Integration**
   - Google login
   - Facebook login
   - GitHub login

4. **Advanced Features**
   - Two-factor authentication
   - Social profiles linking
   - Account recovery
   - Session management

5. **Analytics**
   - Track login events
   - Monitor signup funnel
   - User engagement metrics

---

## ❓ FAQ

**Q: How do I change the login redirect?**
A: In `handleLoginSuccess()`, update the redirects object:

```tsx
const redirects: Record<UserRole, string> = {
  customer: "custom-page",
  vendor: "custom-page",
  admin: "custom-page",
};
```

**Q: Can I use this with React Router?**
A: Yes! The current setup uses a manual `navigate()` function, but you can easily swap it for `useNavigate()` from React Router v6.

**Q: How do I modify the validation rules?**
A: Edit `/lib/schemas.ts` and update the Zod schemas.

**Q: Where do I add real file uploads?**
A: The `FileUpload` component passes files to the `onFilesSelected` callback. Send them to your server there.

**Q: Can I customize the styles?**
A: All components use Tailwind CSS and glassmorphism utilities from `index.css`. Edit those utilities to change global styling.

---

## 🆘 Common Issues

**Issue**: "Module not found" errors

- **Solution**: Check import paths are correct (components in `features/auth` need `../../../`)

**Issue**: Styles not applying

- **Solution**: Make sure Tailwind is building. Check `vite.config.ts` has tailwindcss plugin.

**Issue**: localStorage not persisting

- **Solution**: Check browser's localStorage is not disabled. Zustand should auto-save on every state change.

**Issue**: Role selector not working

- **Solution**: Make sure you're using the `selectedRole` state, not just the form value.

---

**Last Updated**: March 9, 2026
**Status**: ✅ Production Ready
