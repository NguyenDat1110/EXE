# STAGEWISE Auth System - Component Architecture Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                               │
│  (Main app with routing, navbar, auth state integration)       │
└─────────────────┬───────────────────────────────┬──────────────┘
                  │                               │
        ┌─────────▼──────────┐         ┌─────────▼──────────┐
        │   Login/Register   │         │    Profile Pages   │
        │     Pages (Auth)   │         │   (Protected)      │
        └─────────┬──────────┘         └─────────┬──────────┘
                  │                               │
        ┌─────────▼──────────┐         ┌─────────▼──────────┐
        │  Forms Component   │         │  Profile Component │
        │  - LoginForm       │         │  - Tabs            │
        │  - RegisterForm    │         │  - EditableFields  │
        │  - Validation      │         │  - Sections        │
        └─────────┬──────────┘         └─────────┬──────────┘
                  │                               │
        ┌─────────▼──────────────────────────────▼──────────┐
        │           Zustand Store: authStore               │
        │  (User state, login, logout, updateProfile)      │
        │  └─ localStorage persistence                      │
        └─────────────────────────────────────────────────┘
                          │
        ┌─────────────────▼────────────────────┐
        │      UI Component Library            │
        │  - Avatar                            │
        │  - Tabs                              │
        │  - FileUpload                        │
        │  - PasswordStrength                  │
        │  - Toast                             │
        └──────────────────────────────────────┘
```

---

## 📦 Component Dependency Tree

```
App.tsx
├── LoginPage
│   ├── LoginForm
│   │   ├── useAuthStore
│   │   └── Validation (Zod)
│   └── RegisterForm
│       ├── useAuthStore
│       ├── FileUpload
│       ├── PasswordStrength
│       └── Validation (Zod)
│
├── CustomerProfile
│   ├── useAuthStore
│   ├── Avatar
│   ├── Tabs
│   │   ├── EditableField
│   │   └── PasswordStrength
│   └── Profile sections
│
├── VendorProfile
│   ├── useAuthStore
│   ├── Avatar
│   ├── Tabs
│   │   ├── EditableField
│   │   ├── FileUpload
│   │   └── Profile sections
│   └── Charts (placeholder)
│
└── Navbar
    ├── Avatar (profile button)
    ├── Bell (notifications)
    ├── Profile Dropdown
    │   └── useAuthStore
    └── Logout button
```

---

## 🔄 Data Flow

### Authentication Flow

```
User Input (Login Form)
         ↓
    ┌────────────────────────┐
    │  Zod Validation        │
    │  (email, password role)│
    └────────┬───────────────┘
             ↓ Valid
    ┌────────────────────────┐
    │ useAuthStore.login()   │
    │ - Simulate API call    │
    │ - Create mock user     │
    │ - Generate token       │
    └────────┬───────────────┘
             ↓ Success
    ┌────────────────────────┐
    │ Update Auth State      │
    │ - user object          │
    │ - isAuthenticated      │
    │ - role                 │
    │ - token                │
    └────────┬───────────────┘
             ↓ Saved
    ┌────────────────────────┐
    │ localStorage persist   │
    │ (via Zustand)          │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ Navigate to Dashboard  │
    │ Show success toast     │
    └────────────────────────┘
```

### Profile Edit Flow

```
User Clicks Edit
        ↓
EditableField Toggle
        ↓
    Input Mode
    (edit icon)
        ↓
User Enter Data
        ↓
Click Save Icon
        ↓
useAuthStore.updateProfile()
        ↓
Update User Object
        ↓
localStorage Update
        ↓
Show updated value
```

---

## 🎯 State Management (Zustand Store)

### Initial State

```typescript
{
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  token: null
}
```

### Persisted State (localStorage)

```json
{
  "user": { id, email, name, role, avatar, phone, ... },
  "role": "customer|vendor|admin",
  "isAuthenticated": true,
  "token": "mock-token-xxx"
}
```

### Mutations

```typescript
// Login
login(email, password, role)
  → sets user, role, isAuthenticated, token

// Register
register(data)
  → creates user, sets all auth state

// Update Profile
updateProfile(data)
  → merges data into user object

// Logout
logout()
  → clears all state + localStorage
```

---

## 🎨 Component Sizes & Breakpoints

### Responsive Design

```
Mobile (< 768px)
├── Single column layout
├── Full-width forms
└── Stacked tabs

Tablet (768px - 1024px)
├── Tablet layout
├── Form columns adjust
└── Tab content readable

Desktop (> 1024px)
├── 2-column grid (1fr_2fr)
├── Side-by-side layout
└── Full feature display
```

### Avatar Sizes

```
sm:  8px   (navbar)
md:  12px  (lists)
lg:  16px  (profile cards)
xl:  24px  (large profiles)
```

### Form Widths

```
Max width: 448px (28rem)
Padding: 6-8 (mobile to desktop)
Input height: 40px (2.5rem)
Button height: 44px (2.75rem)
```

---

## 🔐 Security Features Implemented

### Client-Side

- ✅ Zod validation (prevents malformed data)
- ✅ Type safety (TypeScript)
- ✅ Password strength indicator
- ✅ Show/hide toggle for passwords
- ✅ Logout clears all sensitive data

### Storage

- ✅ localStorage for state (consider httpOnly for production)
- ✅ Auto-clears on logout
- ✅ Token-based auth ready

### Best Practices

- ⚠️ Mock auth only - use HTTPS in production
- ⚠️ Validate all inputs on server too
- ⚠️ Use secure cookies instead of localStorage for tokens
- ⚠️ Implement CSRF protection
- ⚠️ Rate limit login attempts

---

## 🧩 Customization Points

### 1. Change Default Role

```tsx
// In LoginForm.tsx line 37
const [selectedRole, setSelectedRole] = useState<UserRole>("vendor"); // Changed
```

### 2. Modify Redirect Paths

```tsx
// In LoginPage.tsx line 12-15
const redirects: Record<UserRole, string> = {
  customer: "custom-path",
  vendor: "another-path",
  admin: "admin-path",
};
```

### 3. Add Custom Validation

```tsx
// In lib/schemas.ts
const loginSchema = z.object({
  // Add new fields here
  acceptTerms: z.boolean().refine((v) => v === true),
});
```

### 4. Extend User Model

```tsx
// In authStore.ts User interface
export interface User {
  // Add custom fields
  preferences?: { theme: "light" | "dark" };
  twoFactorEnabled?: boolean;
}
```

### 5. Add New Profile Tabs

```tsx
// In CustomerProfile.tsx
const tabs: TabItem[] = [
  // ... existing tabs
  {
    id: "notifications",
    label: "Thông báo",
    content: <NotificationSettings />,
  },
];
```

---

## 📊 Component States

### LoginForm States

```
┌─────────────────┐
│    Idle         │
│  (default)      │
└────────┬────────┘
         │ showPassword changed
         ▼
┌─────────────────┐
│   Password      │
│   Visible       │
└─────────────────┘

         │ showPassword changed
         ▼
┌─────────────────┐
│   Password      │
│   Hidden        │
└─────────────────┘

         │ form submitted
         ▼
┌─────────────────┐
│    Loading      │
│ (1.5s delay)    │
└────────┬────────┘
         │ success
         ▼
┌─────────────────┐
│   Success       │
│   Toast shown   │
└─────────────────┘
```

### RegisterForm States

```
Step 1 (Role + Basic Info)
         │
         ▼
Step 2A (Customer) OR Step 2B (Vendor)
         │
         ▼
Submitting...
         │
         ▼
Pending Review (Vendor only) / Success (Customer)
```

### EditableField States

```
View Mode
  ├─ Show value
  ├─ Show edit icon on hover
  └─ Click edit → toggle

Edit Mode
  ├─ Show input field
  ├─ Show save/cancel icons
  └─ Click save → validate & update
```

---

## 🎬 Animation Timeline

### Page Transitions

```
Mount
  ├─ initial: opacity: 0, y: 20
  ├─ animate: opacity: 1, y: 0
  ├─ duration: 0.5s
  └─ Exit: opacity: 0, y: -20
```

### Form Elements

```
Input Focus
  ├─ transition: all 0.3s
  ├─ ring-2 ring-cyan
  └─ scale: 1.01

Button Hover
  ├─ whileHover: scale: 1.01
  ├─ whileTap: scale: 0.99
  └─ shadow: 0 0 20px rgba(0, 212, 255, 0.3)
```

### Toast Notifications

```
Enter
  ├─ opacity: 0 → 1
  ├─ y: 20 → 0
  ├─ scale: 0.95 → 1
  └─ duration: 0.3s

Auto-dismiss after 3s
```

---

## 🚦 Route Protection Strategy

```
Protected Route
    │
    ├─ Check isAuthenticated
    │  ├─ False → redirect to /login
    │  └─ True → continue
    │
    ├─ Check requiredRoles
    │  ├─ Role not in list → redirect to allowed dashboard
    │  └─ Role in list → render component
    │
    └─ Component renders with user data
```

---

## 📱 Mobile-First Approach

```
Base (Mobile)
├─ Full-width
├─ Single column
├─ Touch-friendly buttons (44px min)
└─ Large input fields

@medium (768px)
├─ Optimize spacing
├─ 2 columns where possible
└─ Adjust padding

@large (1024px)
├─ Full 2-column layout
├─ Side panels
└─ Optimized grid
```

---

## 🔧 Development Workflow

### Adding a New Feature

1. **Define Types** (TypeScript interfaces)
2. **Add Validation** (Zod schema if needed)
3. **Update Store** (Zustand if state needed)
4. **Create Component** (React component with types)
5. **Wire to App** (Add route/nav link)
6. **Style** (Tailwind + glassmorphism)
7. **Test** (Try all user flows)

### Testing Checklist

- [ ] Form validation works
- [ ] localStorage persists
- [ ] Logout clears data
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Accessibility (tab, keyboard)
- [ ] Error states show
- [ ] Redirects work

---

**Last Updated**: March 9, 2026
