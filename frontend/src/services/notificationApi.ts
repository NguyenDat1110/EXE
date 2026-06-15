import api from './api';

export const getNotifications = async (page = 1, limit = 20) => {
  const res = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return res.data;
};

export const markAsRead = async (notificationId: string) => {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await api.patch('/notifications/mark-all-read');
  return res.data;
};
