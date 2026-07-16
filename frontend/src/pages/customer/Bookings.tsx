import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, DollarSign, Clock3, AlertTriangle, Image as ImageIcon, Banknote, X, Star, CreditCard, CheckCircle2, ChevronRight, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  cancelBooking,
  confirmCustomerComplete,
  getMyBookings
} from '../../services/bookingsApi';
import { createBookingDepositPayment, createBookingFinalPayment } from '../../services/paymentApi';
import { createReview } from '../../services/reviewApi';

const STATUS_GROUPS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Đang xử lý' },
  { id: 'confirmed', label: 'Đã cọc' },
  { id: 'completed', label: 'Đã hoàn tất' },
  { id: 'cancelled', label: 'Đã hủy' }
];

const statusLabel = (status: string) => {
  if (status === 'completed') return { text: 'Đã hoàn tất', classes: 'bg-green-500/10 text-green-400 border border-green-500/20' };
  if (status === 'customer_completed') return { text: 'Chờ thanh toán', classes: 'bg-cyan/10 text-cyan border border-cyan/20' };
  if (status === 'vendor_completed') return { text: 'Vendor hoàn thành', classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
  if (status === 'confirmed') return { text: 'Đã cọc', classes: 'bg-primary/10 text-primary border border-primary/20' };
  if (status === 'deposit_rejected') return { text: 'Từ chối biên lai', classes: 'bg-red-500/10 text-red-400 border border-red-500/20' };
  if (status === 'waiting_deposit') return { text: 'Chờ cọc', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  if (status === 'pending') return { text: 'Chờ duyệt', classes: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' };
  if (status === 'cancelled') return { text: 'Đã hủy', classes: 'bg-red-500/10 text-red-400 border border-red-500/20' };
  return { text: 'Đang xử lý', classes: 'bg-white/5 text-slate-300 border border-white/10' };
};

const getStatusGroup = (status: string) => {
  if (['completed'].includes(status)) return 'completed';
  if (['confirmed', 'customer_completed', 'vendor_completed'].includes(status)) return 'confirmed';
  if (['cancelled', 'deposit_rejected'].includes(status)) return 'cancelled';
  return 'pending'; // pending, waiting_deposit
};

const TimelineProgress = ({ status }: { status: string }) => {
  const steps = [
    { id: 'pending', label: 'Chờ duyệt', activeStates: ['pending', 'waiting_deposit', 'confirmed', 'vendor_completed', 'customer_completed', 'completed'] },
    { id: 'deposit', label: 'Đặt cọc', activeStates: ['waiting_deposit', 'confirmed', 'vendor_completed', 'customer_completed', 'completed'] },
    { id: 'confirmed', label: 'Chờ thực hiện', activeStates: ['confirmed', 'vendor_completed', 'customer_completed', 'completed'] },
    { id: 'completed', label: 'Hoàn tất', activeStates: ['completed'] }
  ];

  if (status === 'cancelled' || status === 'deposit_rejected') {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20 w-fit">
        <AlertTriangle className="w-4 h-4" />
        Đơn hàng đã bị hủy
      </div>
    );
  }

  return (
    <div className="flex items-center w-full max-w-2xl mt-4 mb-2">
      {steps.map((step, index) => {
        const isActive = step.activeStates.includes(status);
        const isPast = step.activeStates.indexOf(status) > step.activeStates.indexOf(step.id);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isActive ? 'bg-cyan text-navy border-cyan shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 
                isPast ? 'bg-cyan/20 border-cyan text-cyan' : 'bg-navy border-white/20 text-white/40'
              }`}>
                {isActive || isPast ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider absolute top-10 whitespace-nowrap ${isActive ? 'text-cyan' : 'text-silver/50'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 bg-white/10 relative overflow-hidden rounded-full mt-[-20px]">
                <div 
                  className="absolute top-0 left-0 h-full bg-cyan transition-all duration-1000 ease-out"
                  style={{ width: isActive || isPast ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // default true for initial load
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

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

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings;
    return bookings.filter((b) => getStatusGroup(b.status) === activeTab);
  }, [bookings, activeTab]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => getStatusGroup(b.status) === 'pending').length,
      completed: bookings.filter(b => getStatusGroup(b.status) === 'completed').length,
    };
  }, [bookings]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-white mb-2">Đơn Đặt Chỗ</h1>
          <p className="text-silver/70 text-sm md:text-base">Theo dõi tiến độ, thanh toán và quản lý các sự kiện của bạn.</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="glass-card px-5 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-[10px] uppercase tracking-wider text-silver/60">Tổng đơn</span>
          </div>
          <div className="glass-card border-amber-500/20 bg-amber-500/5 px-5 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-bold text-amber-400">{stats.pending}</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/60">Đang chờ</span>
          </div>
          <div className="glass-card border-green-500/20 bg-green-500/5 px-5 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-bold text-green-400">{stats.completed}</span>
            <span className="text-[10px] uppercase tracking-wider text-green-400/60">Hoàn tất</span>
          </div>
        </div>
      </div>

      {paymentError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" /> {paymentError}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {STATUS_GROUPS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-cyan' : 'text-silver/50 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl border border-white/5 bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
        >
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-cyan/20 blur-2xl rounded-full" />
            <PackageOpen className="w-full h-full text-white/20 relative z-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Chưa có đơn hàng nào</h3>
          <p className="text-silver/60 mb-8 max-w-md">
            {activeTab === 'all' 
              ? 'Bạn chưa đặt dịch vụ nào. Khám phá các gian hàng tuyệt vời và bắt đầu tổ chức sự kiện ngay!' 
              : 'Không có đơn hàng nào trong trạng thái này.'}
          </p>
          <Link 
            to="/explore" 
            className="px-8 py-3 bg-cyan text-navy font-bold rounded-full hover:bg-cyan/90 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] flex items-center gap-2"
          >
            Khám phá ngay <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const status = statusLabel(b.status);
            const depositAmount = b.depositAmount || 0;
            const remainingAmount = b.remainingAmount || Math.max((b.totalPrice || 0) - depositAmount, 0);
            const receiptUrl = b.depositReceiptUrl || b.finalReceiptUrl || '';
            const isLoading = actionLoadingId === b._id;
            const canSubmitDeposit = b.status === 'waiting_deposit' && b.paymentStatus !== 'deposit_pending';
            const isDepositPending = b.status === 'waiting_deposit' && b.paymentStatus === 'deposit_pending';

            // Calculate progress %
            let progressWidth = '0%';
            if (['confirmed', 'vendor_completed', 'customer_completed'].includes(b.status)) progressWidth = '30%';
            if (b.status === 'completed') progressWidth = '100%';

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={b._id} 
                className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-8 hover:border-cyan/30 transition-colors group"
              >
                {/* Top header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-custom overflow-hidden border border-white/10 shrink-0">
                      <img 
                        src={b.vendor?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${b.vendor?._id}`} 
                        alt="Vendor" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded font-mono text-cyan font-bold tracking-wider">#{b._id.slice(-6).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status.classes}`}>{status.text}</span>
                      </div>
                      <h2 className="text-xl font-bold text-white group-hover:text-cyan transition-colors">{b.vendor?.name || 'Nhà cung cấp'}</h2>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-silver/60 mb-1">Tổng tiền</p>
                    <p className="text-2xl font-bold text-white">{formatMoney(b.totalPrice || 0)}</p>
                  </div>
                </div>

                {/* Content grid */}
                <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
                  {/* Left: Details */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm uppercase tracking-widest text-silver/50 font-semibold mb-2">Gói dịch vụ</p>
                      <p className="text-lg font-medium text-white">{b.package?.name || 'Gói dịch vụ'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-silver/50 text-xs uppercase font-semibold"><CalendarDays className="w-3.5 h-3.5 text-cyan" /> Ngày diễn ra</div>
                        <p className="text-white font-medium">{b.eventDate?.split('T')[0] || '---'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-silver/50 text-xs uppercase font-semibold"><Clock3 className="w-3.5 h-3.5 text-cyan" /> Thời gian</div>
                        <p className="text-white font-medium">{b.startTime || '--:--'} <span className="text-silver/50 text-sm">({b.package?.serviceDuration ? `${b.package.serviceDuration}p` : '--'})</span></p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <div className="flex items-center gap-1.5 text-silver/50 text-xs uppercase font-semibold"><MapPin className="w-3.5 h-3.5 text-cyan" /> Địa điểm</div>
                        <p className="text-white font-medium">{b.eventAddress || b.booth?.name || 'Địa điểm chưa rõ'}</p>
                      </div>
                    </div>
                    
                    {/* Timeline Tracker */}
                    <div className="pt-6 pb-2">
                      <TimelineProgress status={b.status} />
                    </div>
                  </div>

                  {/* Right: Payments & Actions */}
                  <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-cyan" />
                        <h3 className="font-semibold text-white">Thanh toán</h3>
                      </div>

                      {/* Payment Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-silver/60">Tiến độ</span>
                          <span className="text-cyan">{progressWidth}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan rounded-full transition-all duration-1000" style={{ width: progressWidth }} />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span className="text-silver/60">Đặt cọc</span>
                          <span className={`font-semibold ${['confirmed', 'vendor_completed', 'customer_completed', 'completed'].includes(b.status) ? 'text-green-400' : 'text-white'}`}>
                            {formatMoney(depositAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-silver/60">Còn lại</span>
                          <span className={`font-semibold ${b.status === 'completed' ? 'text-green-400' : 'text-white'}`}>
                            {formatMoney(remainingAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-4">
                      {b.status === 'pending' && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleAction(b._id, 'cancel')}
                          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      )}
                      
                      {canSubmitDeposit && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleAction(b._id, 'deposit')}
                          className="w-full py-3 bg-cyan text-navy rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-cyan/90 shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50"
                        >
                          {isLoading ? 'Đang tạo link...' : 'Thanh toán cọc'}
                        </button>
                      )}
                      
                      {b.status === 'vendor_completed' && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleAction(b._id, 'confirm')}
                          className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          Xác nhận hoàn thành
                        </button>
                      )}
                      
                      {b.status === 'customer_completed' && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleAction(b._id, 'final')}
                          className="w-full py-3 bg-cyan text-navy rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-cyan/90 shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50"
                        >
                          {isLoading ? 'Đang tạo link...' : 'Thanh toán còn lại'}
                        </button>
                      )}

                      {b.status === 'completed' && !b.isReviewed && (
                        <button
                          disabled={isLoading}
                          onClick={() => {
                            setReviewModalBooking(b);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                          className="w-full py-3 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-yellow-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Star className="w-4 h-4" /> Viết đánh giá
                        </button>
                      )}
                      
                      {b.status === 'completed' && b.isReviewed && (
                        <div className="w-full py-3 bg-white/5 border border-white/10 text-silver/60 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                          <Star className="w-4 h-4 fill-current text-yellow-400" /> Đã đánh giá
                        </div>
                      )}
                      
                      {isDepositPending && (
                        <div className="w-full py-3 text-center bg-white/5 border border-white/10 text-silver/60 rounded-xl text-xs uppercase tracking-wider font-semibold">
                          Chờ vendor xác nhận cọc
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {receiptUrl && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-silver/70">
                      <ImageIcon className="w-4 h-4 text-cyan" /> Đã tải lên biên lai
                    </div>
                    <a href={receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan text-sm transition-colors font-medium">
                      <Banknote className="w-4 h-4" /> Xem biên lai
                    </a>
                  </div>
                )}
                
                {b.paymentStatus === 'deposit_rejected' && b.depositRejectedReason && (
                  <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
                    <p className="font-bold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Lý do từ chối biên lai:</p>
                    <p className="opacity-90">{b.depositRejectedReason}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setReviewModalBooking(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-surface shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6 bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Đánh giá dịch vụ</h2>
                  <p className="text-sm text-silver/60">
                    Trải nghiệm của bạn với <span className="text-cyan font-semibold">{reviewModalBooking.vendor?.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setReviewModalBooking(null)}
                  className="rounded-full p-2 text-silver/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-8 py-8 space-y-8">
                <div className="flex flex-col items-center justify-center gap-4">
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
                          className="p-1 focus:outline-none transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-12 h-12 transition-all duration-300 ${
                              isFilled ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase text-cyan bg-cyan/10 px-4 py-1.5 rounded-full border border-cyan/20">
                    {reviewRating === 5 && 'Tuyệt vời!'}
                    {reviewRating === 4 && 'Rất tốt'}
                    {reviewRating === 3 && 'Bình thường'}
                    {reviewRating === 2 && 'Kém'}
                    {reviewRating === 1 && 'Rất tệ'}
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-silver/80 block uppercase tracking-wider">Chia sẻ trải nghiệm (Tùy chọn)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Viết nhận xét của bạn để giúp người khác đưa ra quyết định tốt hơn..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-silver/30 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all resize-none text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setReviewModalBooking(null)}
                    className="flex-1 rounded-xl border border-white/10 py-3.5 text-sm font-bold text-silver hover:bg-white/5 hover:text-white transition-colors uppercase tracking-wider"
                    type="button"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting}
                    className="flex-[2] rounded-xl bg-cyan py-3.5 text-sm font-bold uppercase tracking-wider text-navy hover:bg-cyan/90 disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                    type="button"
                  >
                    {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
