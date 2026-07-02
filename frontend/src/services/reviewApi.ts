import api from './api';

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface ReviewItem {
  _id: string;
  bookingId: string;
  customerId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  vendorId: string;
  rating: number;
  comment: string;
  vendorReply?: string;
  vendorRepliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const createReview = async (payload: CreateReviewPayload) => {
  const res = await api.post('/reviews', payload);
  return res.data;
};

export const getVendorReviews = async (vendorId: string): Promise<ReviewItem[]> => {
  const res = await api.get(`/reviews/vendor/${vendorId}`);
  return res.data?.reviews || [];
};

export const getBookingReview = async (bookingId: string): Promise<ReviewItem | null> => {
  const res = await api.get(`/reviews/booking/${bookingId}`);
  return res.data?.review || null;
};

export const replyToReview = async (reviewId: string, reply: string) => {
  const res = await api.patch(`/reviews/${reviewId}/reply`, { reply });
  return res.data;
};
