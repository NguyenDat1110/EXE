// Mock test accounts for development
export interface MockUser {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  companyName?: string;
  taxId?: string;
  companyAddress?: string;
  businessLicense?: string;
  bio?: string;
}

export const MOCK_USERS: MockUser[] = [
  // Customer account
  {
    email: 'customer@test.com',
    password: '123456',
    name: 'Nguyễn Văn A',
    role: 'customer',
    phone: '0987654321',
    dateOfBirth: '1990-05-15',
    address: '123 Nguyễn Huệ',
    city: 'Ho Chi Minh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer',
  },
  // Vendor account
  {
    email: 'vendor@test.com',
    password: '123456',
    name: 'Công ty Sự kiện Starlight',
    role: 'vendor',
    phone: '0912345678',
    companyName: 'Công ty Sự kiện Starlight',
    taxId: '0123456789',
    companyAddress: '456 Lê Lợi, Q.1, TP.HCM',
    businessLicense: 'https://via.placeholder.com/400x300?text=License',
    bio: 'Chúng tôi chuyên tổ chức các sự kiện corporate, tiệc cưới, sinh nhật với chất lượng cao nhất.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vendor',
  },
  // Admin account
  {
    email: 'admin@test.com',
    password: '123456',
    name: 'Admin Manager',
    role: 'admin',
    phone: '0900000000',
    address: 'Admin Office',
    city: 'Ho Chi Minh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  // Additional test customer
  {
    email: 'john@test.com',
    password: '123456',
    name: 'John Doe',
    role: 'customer',
    phone: '0988888888',
    dateOfBirth: '1992-03-20',
    address: '789 Đinh Tiên Hoàng',
    city: 'Da Nang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
  // Additional test vendor
  {
    email: 'duong@test.com',
    password: '123456',
    name: 'Đường Events & Catering',
    role: 'vendor',
    phone: '0933333333',
    companyName: 'Đường Events & Catering',
    taxId: '9876543210',
    companyAddress: '321 Tân Cảng, Q.Bình Thạnh, TP.HCM',
    businessLicense: 'https://via.placeholder.com/400x300?text=License2',
    bio: 'Dịch vụ catering chuyên nghiệp cho các sự kiện lớn với đội bếp chuyên sâu.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duong',
  },
];

// Find mock user by email and password
export const findMockUser = (
  email: string,
  password: string
): MockUser | undefined => {
  return MOCK_USERS.find(
    (user) => user.email === email && user.password === password
  );
};

// Get all mock user emails for reference
export const getMockUserEmails = (): string[] => {
  return MOCK_USERS.map((user) => `${user.email} (${user.role})`);
};
