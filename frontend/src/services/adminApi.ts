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

// UC-39: Package Management
export const getAllPackages = async () => {
  const response = await api.get('/admin/packages');
  return response.data;
};

export const togglePackageStatus = async (vendorId: string, packageId: string, isActive: boolean) => {
  const response = await api.patch(`/admin/packages/${vendorId}/${packageId}/status`, { isActive });
  return response.data;
};

// UC-40: Complaint Management
export const getReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

export const updateReportStatus = async (reportId: string, status: string, adminNotes?: string) => {
  const response = await api.patch(`/admin/reports/${reportId}/status`, { status, adminNotes });
  return response.data;
};

// UC-41 & UC-43: Subscription Management
export const getSubscriptionPlans = async () => {
  const response = await api.get('/admin/subscriptions/plans');
  return response.data;
};

export const createSubscriptionPlan = async (planData: any) => {
  const response = await api.post('/admin/subscriptions/plans', planData);
  return response.data;
};

export const updateSubscriptionPlan = async (planId: string, planData: any) => {
  const response = await api.put(`/admin/subscriptions/plans/${planId}`, planData);
  return response.data;
};

export const updateVendorSubscription = async (vendorId: string, data: { action: 'extend' | 'revoke', planType?: string, days?: number }) => {
  const response = await api.post(`/admin/vendors/${vendorId}/subscription`, data);
  return response.data;
};

// UC-42: Activity Logs
export const getActivityLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data;
};
