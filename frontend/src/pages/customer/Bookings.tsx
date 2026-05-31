import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, DollarSign, Clock3, AlertTriangle, Image as ImageIcon, Banknote, X, Upload, CheckCircle2 } from 'lucide-react';
import {
  cancelBooking,
  confirmCustomerComplete,
  getMyBookings,
  payBookingDeposit,
  payFinalBalance
} from '../../services/bookingsApi';

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
  const [paymentModalBooking, setPaymentModalBooking] = useState<any | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

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
    try {
      if (action === 'cancel') await cancelBooking(bookingId);
      if (action === 'deposit') {
        const booking = bookings.find((item) => item._id === bookingId);
        if (booking) {
          setPaymentModalBooking(booking);
          setPaymentFile(null);
          setPaymentPreview(null);
        }
        setActionLoadingId(null);
        return;
      }
      if (action === 'confirm') await confirmCustomerComplete(bookingId);
      if (action === 'final') {
        const booking = bookings.find((item) => item._id === bookingId);
        if (booking) {
          setPaymentModalBooking(booking);
          setPaymentFile(null);
          setPaymentPreview(null);
        }
        setActionLoadingId(null);
        return;
      }
      await loadBookings();
    } catch {
      // handled by UI state refresh
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentModalBooking) return;
    setPaymentSubmitting(true);
    setActionLoadingId(paymentModalBooking._id);
    try {
      if (paymentModalBooking.status === 'waiting_deposit') {
        await payBookingDeposit(paymentModalBooking._id, paymentFile || undefined);
      } else if (paymentModalBooking.status === 'customer_completed') {
        await payFinalBalance(paymentModalBooking._id, paymentFile || undefined);
      }
      await loadBookings();
      setPaymentModalBooking(null);
      setPaymentFile(null);
      setPaymentPreview(null);
    } finally {
      setPaymentSubmitting(false);
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (!paymentFile) {
      setPaymentPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(paymentFile);
    setPaymentPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [paymentFile]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Đơn Đặt Chỗ Của Tôi</h1>
        <p className="text-silver/60 mt-1">Theo dõi trạng thái, thanh toán cọc và hoàn tất đơn sau sự kiện.</p>
      </div>

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
                      <p className="font-semibold text-white">{b.package?.serviceDuration || '--'}</p>
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
                      Thanh toán cọc
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
                      Gửi biên lai phần còn lại
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <span className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-400 text-xs uppercase tracking-wider">
                      Chờ đến thời gian tổ chức để vendor xác nhận hoàn thành
                    </span>
                  )}
                  {b.status === 'completed' && (
                    <span className="px-5 py-2.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs uppercase tracking-wider">
                      Đơn đã hoàn tất
                    </span>
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
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111827] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Thanh toán cọc</h2>
                <p className="mt-1 text-sm text-slate-400">Chuyển khoản theo thông tin bên dưới và tải biên lai lên để gửi cho vendor.</p>
              </div>
              <button
                onClick={() => {
                  setPaymentModalBooking(null);
                  setPaymentFile(null);
                  setPaymentPreview(null);
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Đóng modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Tên chủ tài khoản</p>
                  <p className="text-base font-semibold text-white">{paymentModalBooking.vendor?.accountHolderName || '---'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Số tài khoản</p>
                  <p className="text-base font-semibold text-white">{paymentModalBooking.vendor?.accountNumber || '---'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Tên ngân hàng</p>
                  <p className="text-base font-semibold text-white">{paymentModalBooking.vendor?.bankName || '---'}</p>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-primary/80 mb-1">Số tiền cần thanh toán</p>
                  <p className="text-2xl font-bold text-primary">{formatMoney(paymentModalBooking.depositAmount || 0)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.03] px-4 py-10 text-center hover:border-primary/50 hover:bg-white/[0.06] transition-colors">
                  <Upload className="mb-3 h-8 w-8 text-slate-400" />
                  <span className="text-sm font-semibold text-white">Tải biên lai thanh toán</span>
                  <span className="mt-1 text-xs text-slate-500">PNG, JPG, PDF - xem trước trước khi gửi</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const nextFile = e.target.files?.[0] || null;
                      setPaymentFile(nextFile);
                    }}
                  />
                </label>

                {paymentPreview && paymentFile?.type.startsWith('image/') && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                      <ImageIcon className="h-4 w-4 text-cyan" /> Xem trước biên lai
                    </div>
                    <img src={paymentPreview} alt="Receipt preview" className="max-h-64 w-full rounded-xl border border-white/10 object-contain bg-black/20" />
                  </div>
                )}

                {paymentFile && !paymentFile.type.startsWith('image/') && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                    Đã chọn file: <span className="font-semibold text-white">{paymentFile.name}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPaymentModalBooking(null);
                      setPaymentFile(null);
                      setPaymentPreview(null);
                    }}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
                    type="button"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={paymentSubmitting}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-background-dark disabled:opacity-60"
                    type="button"
                  >
                    {paymentSubmitting ? 'Đang gửi...' : 'Thanh toán cọc'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
