import api from './api';

export const getNotifications = (page = 1) => api.get(`/notifications?page=${page}`);
export const markAsRead = (id: string) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/read-all');
