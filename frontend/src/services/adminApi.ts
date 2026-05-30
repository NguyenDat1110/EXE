import api from './api';

// Admin Dashboard Stats
export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Admin Users Management
export const getAllUsers = async (search?: string, role?: string, page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role && role !== 'all') params.append('role', role);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await api.get(`/admin/users?${params}`);
  return response.data;
};

export const getUserDetail = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const lockUser = async (userId: string) => {
  const response = await api.post(`/admin/users/${userId}/lock`);
  return response.data;
};

export const unlockUser = async (userId: string) => {
  const response = await api.post(`/admin/users/${userId}/unlock`);
  return response.data;
};

// UC-09: Vendor Verification
export const getPendingVendors = async (status: string = 'pending', page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams();
  params.append('status', status);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await api.get(`/admin/vendors?${params}`);
  return response.data;
};

export const approveVendor = async (vendorId: string) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/approve`);
  return response.data;
};

export const rejectVendor = async (vendorId: string, reason: string) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/reject`, { reason });
  return response.data;
};
