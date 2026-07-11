import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, DollarSign, Clock3, AlertTriangle, Image as ImageIcon, Banknote, X, Star } from 'lucide-react';
import {
  cancelBooking,
  confirmCustomerComplete,
  getMyBookings
} from '../../services/bookingsApi';
import { createBookingDepositPayment, createBookingFinalPayment } from '../../services/paymentApi';
import { createReview } from '../../services/reviewApi';

const statusLabel = (status: string) => {
  if (status === 'completed') return { text: 'Đã hoàn tất', classes: 'bg-green-500/20 text-green-400 border border-green-500/30' };
  if (status === 'customer_completed') return { text: 'Chờ thanh toán còn lại', classes: 'bg-cyan/20 text-cyan border border-cyan/30' };
  if (status === 'vendor_completed') return { text: 'Vendor đã hoàn thành', classes: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
  if (status === 'confirmed') return { text: 'Đã cọc', classes: 'bg-primary/20 text-primary border border-primary/30' };
  if (status === 'deposit_rejected') return { text: 'Biên lai bị từ chối', classes: 'bg-red-500/20 text-red-300 border border-red-500/30' };
  if (status === 'waiting_deposit') return { text: 'Chờ thanh toán cọc', classes: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
  if (status === 'pending') return { text: 'Chờ duyệt', classes: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' };
  if (status === 'cancelled') return { text: 'Đã hủy', classes: 'bg-red-500/20 text-red-300 border border-red-500/30' };
  return { text: 'Đang xử lý', classes: 'bg-white/10 text-slate-200 border border-white/10' };
};

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Review states
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);

  const handleReviewSubmit = async () => {
    if (!reviewModalBooking) return;
    setReviewSubmitting(true);
    try {
      await createReview({
        bookingId: reviewModalBooking._id,
        rating: reviewRating,
        comment: reviewComment
      });
      await loadBookings();
      setReviewModalBooking(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (error) {
      console.error('Review submit error:', error);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res?.data?.bookings || []);
    } catch (error) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadBookings();
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  const formatMoney = useMemo(
    () => (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0),
    []
  );

  const handleAction = async (bookingId: string, action: 'cancel' | 'deposit' | 'confirm' | 'final') => {
    setActionLoadingId(bookingId);
    setPaymentError(null);
    try {
      if (action === 'cancel') await cancelBooking(bookingId);
      if (action === 'confirm') await confirmCustomerComplete(bookingId);

      // Thanh toán qua PayOS: tạo link rồi chuyển hướng đến trang thanh toán
      if (action === 'deposit' || action === 'final') {
        const res = action === 'deposit'
          ? await createBookingDepositPayment(bookingId)
          : await createBookingFinalPayment(bookingId);
        const checkoutUrl = res?.data?.checkoutUrl;
        if (!checkoutUrl) throw new Error('Không thể tạo link thanh toán');
        window.location.href = checkoutUrl;
        return;
      }

      await loadBookings();
    } catch (err: any) {
      if (action === 'deposit' || action === 'final') {
        setPaymentError(err?.response?.data?.message || err?.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Đơn Đặt Chỗ Của Tôi</h1>
        <p className="text-silver/60 mt-1">Theo dõi trạng thái, thanh toán cọc và hoàn tất đơn sau sự kiện.</p>
      </div>

      {paymentError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {paymentError}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-slate-400">Đang tải booking...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-slate-400">Bạn chưa có booking nào.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const status = statusLabel(b.status);
            const depositAmount = b.depositAmount || 0;
            const remainingAmount = b.remainingAmount || Math.max((b.totalPrice || 0) - depositAmount, 0);
            const receiptUrl = b.depositReceiptUrl || b.finalReceiptUrl || '';
            const isLoading = actionLoadingId === b._id;
            const canSubmitDeposit = b.status === 'waiting_deposit' && b.paymentStatus !== 'deposit_pending';
            const isDepositPending = b.status === 'waiting_deposit' && b.paymentStatus === 'deposit_pending';

            return (
              <div key={b._id} className="glass-panel p-6 rounded-2xl flex flex-col gap-6 hover:border-cyan/45 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded font-mono text-cyan font-bold">{b._id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.classes}`}>{status.text}</span>
                    {b.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" /> Có thể hủy trước khi vendor duyệt
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white">{b.vendor?.name || 'Nhà cung cấp'}</h2>
                  <p className="text-silver/80 text-sm font-medium">{b.package?.name || 'Gói dịch vụ'}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-silver/60 pt-2">
                    <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-cyan" /> {b.eventDate?.split('T')[0] || '---'}</span>
                    <span className="flex items-center gap-1"><Clock3 className="w-4 h-4 text-cyan" /> {b.startTime || '--:--'}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-cyan" /> {b.eventAddress || b.booth?.name || 'Địa điểm chưa rõ'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-cyan" /> {formatMoney(b.totalPrice || 0)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Tiền cọc yêu cầu</p>
                      <p className="font-semibold text-white">{formatMoney(depositAmount)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Thanh toán sau khi hoàn thành sự kiện</p>
                      <p className="font-semibold text-white">{formatMoney(remainingAmount)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Thời lượng</p>
                      <p className="font-semibold text-white">{b.package?.serviceDuration ? `${b.package.serviceDuration} phút` : '--'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {b.status === 'pending' && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(b._id, 'cancel')}
                      className="px-5 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-300 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-60"
                    >
                      Hủy đơn
                    </button>
                  )}
                  {canSubmitDeposit && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(b._id, 'deposit')}
                      className="px-5 py-2.5 bg-cyan/15 hover:bg-cyan/25 border border-cyan/35 text-cyan hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-60"
                    >
                      {isLoading ? 'Đang tạo link...' : 'Thanh toán cọc qua PayOS'}
                    </button>
                  )}
                  {isDepositPending && (
                    <span className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-400 text-xs uppercase tracking-wider">
                      Đã gửi biên lai, đang chờ vendor xác nhận
                    </span>
                  )}
                  {b.status === 'vendor_completed' && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(b._id, 'confirm')}
                      className="px-5 py-2.5 bg-primary/15 hover:bg-primary/25 border border-primary/35 text-primary hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-60"
                    >
                      Đánh dấu hoàn thành
                    </button>
                  )}
                  {b.status === 'customer_completed' && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(b._id, 'final')}
                      className="px-5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-60"
                    >
                      {isLoading ? 'Đang tạo link...' : 'Thanh toán phần còn lại qua PayOS'}
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <span className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-400 text-xs uppercase tracking-wider">
                      Chờ đến thời gian tổ chức để vendor xác nhận hoàn thành
                    </span>
                  )}
                  {b.status === 'completed' && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-5 py-2.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs uppercase tracking-wider">
                        Đơn đã hoàn tất
                      </span>
                      {b.isReviewed ? (
                        <span className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-silver/60 text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold">
                          <Star className="w-4 h-4 fill-current text-yellow-400" /> Đã đánh giá
                        </span>
                      ) : (
                        <button
                          disabled={isLoading}
                          onClick={() => {
                            setReviewModalBooking(b);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                          className="px-5 py-2.5 bg-cyan/15 hover:bg-cyan/25 border border-cyan/35 text-cyan hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-60 flex items-center gap-1.5"
                        >
                          <Star className="w-4 h-4" /> Viết đánh giá
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {receiptUrl && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <ImageIcon className="w-4 h-4 text-cyan" /> Biên lai đã gửi
                    </div>
                    <a href={receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan text-sm hover:underline">
                      <Banknote className="w-4 h-4" /> Xem ảnh biên lai
                    </a>
                  </div>
                )}

                {b.paymentStatus === 'deposit_rejected' && b.depositRejectedReason && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    <p className="font-semibold text-red-300 mb-1">Biên lai bị từ chối</p>
                    <p>{b.depositRejectedReason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111827] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Đánh giá dịch vụ</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Chia sẻ trải nghiệm của bạn về dịch vụ của <span className="text-cyan font-semibold">{reviewModalBooking.vendor?.name || 'nhà cung cấp'}</span>.
                </p>
              </div>
              <button
                onClick={() => setReviewModalBooking(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Đóng modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="text-sm font-semibold text-silver/80">Bạn đánh giá thế nào?</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = reviewHoverRating !== null ? star <= reviewHoverRating : star <= reviewRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            isFilled ? 'text-yellow-400 fill-current' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-cyan font-bold tracking-wider uppercase mt-1">
                  {reviewRating === 5 && 'Tuyệt vời! (5/5)'}
                  {reviewRating === 4 && 'Rất tốt (4/5)'}
                  {reviewRating === 3 && 'Bình thường (3/5)'}
                  {reviewRating === 2 && 'Kém (2/5)'}
                  {reviewRating === 1 && 'Rất tệ (1/5)'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-silver/80 block">Ý kiến đóng góp (Không bắt buộc)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhập trải nghiệm của bạn tại đây để giúp cộng đồng và nhà cung cấp cải thiện hơn..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-silver/30 focus:outline-none focus:border-cyan transition-colors resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setReviewModalBooking(null)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                  type="button"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting}
                  className="flex-1 rounded-xl bg-cyan px-4 py-3 text-sm font-bold uppercase tracking-widest text-background-dark hover:bg-cyan/90 disabled:opacity-60 transition-colors"
                  type="button"
                >
                  {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
