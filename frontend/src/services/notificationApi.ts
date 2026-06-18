import api from './api';

<<<<<<< HEAD
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
=======
export const getNotifications = (page = 1) => api.get(`/notifications?page=${page}`);
export const markAsRead = (id: string) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/read-all');
>>>>>>> 2c2104e232045224b0df3fdfd9e1d16ab542c5f5
