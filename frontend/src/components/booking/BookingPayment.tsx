import { CheckCircle2, Wallet, AlertCircle, Loader } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBookingDepositPayment } from '../../services/paymentApi';

export default function BookingPayment({ bookingData }: { bookingData: any }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = bookingData?.booking?.depositAmount || bookingData?.package?.depositAmount || Math.round((bookingData?.package?.price || 0) * 0.3);
  const bookingId = bookingData?.booking?._id || '';

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handlePayWithPayOS = async () => {
    if (!bookingId) {
      setError('Không tìm thấy booking. Vui lòng thử lại.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createBookingDepositPayment(bookingId);
      const checkoutUrl = res?.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Không thể tạo link thanh toán');
      // Chuyển hướng sang trang thanh toán PayOS
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-serif text-white">Thanh Toán Tiền Cọc</h3>
        <p className="text-slate-400">Thanh toán tiền cọc an toàn qua cổng PayOS. Hệ thống sẽ tự động xác nhận đơn hàng ngay khi thanh toán thành công.</p>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex justify-between items-center">
            <p className="text-xs uppercase tracking-wider text-slate-500">Mã booking</p>
            <p className="font-semibold text-white font-mono">{bookingId || '---'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex justify-between items-center">
            <p className="text-xs uppercase tracking-wider text-slate-500">Gói dịch vụ</p>
            <p className="font-semibold text-white">{bookingData?.package?.name || '---'}</p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex justify-between items-center">
            <p className="text-xs uppercase tracking-wider text-primary/80">Số tiền cọc cần thanh toán</p>
            <p className="text-2xl font-bold text-primary">{formatVND(amount)}</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handlePayWithPayOS}
            disabled={loading}
            className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cyan-glow disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> Đang tạo link thanh toán...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" /> Thanh toán qua PayOS
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Bạn sẽ được chuyển đến trang thanh toán PayOS (quét mã QR hoặc chuyển khoản). Sau khi thanh toán, hệ thống tự động xác nhận booking.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <button
          onClick={() => navigate('/my-bookings')}
          className="px-8 py-4 border border-white/10 text-slate-300 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
        >
          Thanh toán sau & Xem đơn của tôi <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
