import api from './api';

export const createBooking = async (payload: any) => {
  return api.post('/bookings', payload);
};

export const getBookingById = async (id: string) => {
  return api.get(`/bookings/${id}`);
};

export const getMyBookings = async (params?: Record<string, any>) => {
  return api.get('/bookings/my', { params });
};

export const getVendorAvailability = async (vendorId: string) => {
  return api.get(`/bookings/vendor/${vendorId}/availability`);
};

export const payBookingDeposit = async (bookingId: string, file?: File) => {
  if (file) {
    const fd = new FormData();
    fd.append('receipt', file);
    return api.post(`/bookings/${bookingId}/pay-deposit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post(`/bookings/${bookingId}/pay-deposit`);
};

export const cancelBooking = async (bookingId: string) => {
  return api.post(`/bookings/${bookingId}/cancel`);
};

export const markVendorComplete = async (bookingId: string) => {
  return api.post(`/bookings/${bookingId}/vendor-complete`);
};

export const confirmCustomerComplete = async (bookingId: string) => {
  return api.post(`/bookings/${bookingId}/customer-complete`);
};

export const payFinalBalance = async (bookingId: string, file?: File) => {
  if (file) {
    const fd = new FormData();
    fd.append('receipt', file);
    return api.post(`/bookings/${bookingId}/pay-final-balance`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post(`/bookings/${bookingId}/pay-final-balance`);
};

export const getVendorBookings = async (params?: Record<string, any>) => {
  return api.get('/bookings/vendor/me', { params });
};

export const acceptBooking = async (bookingId: string) => {
  return api.post(`/bookings/${bookingId}/accept`);
};

export const declineBooking = async (bookingId: string) => {
  return api.post(`/bookings/${bookingId}/decline`);
};

export const vendorConfirmDeposit = async (bookingId: string) => {
  return api.post(`/bookings/${bookingId}/confirm-deposit`);
};

export const vendorRejectDeposit = async (bookingId: string, reason: string) => {
  return api.post(`/bookings/${bookingId}/reject-deposit`, { reason });
};
