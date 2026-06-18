import api from './api';

export const createComplaint = (data: { subject: string; description: string; vendorId?: string; bookingId?: string }) =>
  api.post('/complaints', data);

export const getMyComplaints = () => api.get('/complaints/my');
