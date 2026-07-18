import api from './api';

export interface CreatePaymentResponse {
  checkoutUrl?: string;
  orderCode?: number;
  amount?: number;
  activated?: boolean;
  vendor?: any;
}

export interface PaymentStatusResponse {
  orderCode: number;
  type: 'booking_deposit' | 'booking_final' | 'subscription';
  status: 'pending' | 'paid' | 'cancelled';
  amount: number;
  bookingId: string | null;
  subscriptionPlan: string | null;
  paidAt: string | null;
}

// Tạo link thanh toán cọc booking qua PayOS
export const createBookingDepositPayment = async (bookingId: string) => {
  return api.post<CreatePaymentResponse>(`/payment/booking/${bookingId}/deposit`);
};

// Tạo link thanh toán phần còn lại qua PayOS
export const createBookingFinalPayment = async (bookingId: string) => {
  return api.post<CreatePaymentResponse>(`/payment/booking/${bookingId}/final`);
};

// Tạo link thanh toán nâng cấp gói vendor qua PayOS
export const createSubscriptionPayment = async (plan: string) => {
  return api.post<CreatePaymentResponse>('/payment/subscription', { plan });
};

// Kiểm tra trạng thái giao dịch (backend sẽ tự đồng bộ với PayOS nếu webhook chưa về)
export const getPaymentStatus = async (orderCode: number | string) => {
  return api.get<PaymentStatusResponse>(`/payment/status/${orderCode}`);
};
