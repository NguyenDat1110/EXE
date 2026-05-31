import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Landmark, QrCode, Upload, CheckCircle2, Copy, Image as ImageIcon } from 'lucide-react';

import { payBookingDeposit, getBookingById } from '../../services/bookingsApi';

export default function PaymentStep({ showToast, bookingId, bookingStatus }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void, bookingId?: string, bookingStatus?: string }) {
  const [method, setMethod] = useState<'bank' | 'card' | 'ewallet'>('bank');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorBank, setVendorBank] = useState<{ accountHolderName?: string; accountNumber?: string; bankName?: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleConfirm = async () => {
    if (!bookingId) return showToast('Missing booking id', 'error');
    if (bookingStatus !== 'waiting_deposit') return showToast('Chờ nhà cung cấp chấp nhận trước khi thanh toán.', 'error');
    try {
      setLoading(true);
      const res = await payBookingDeposit(bookingId, file || undefined);
      const booking = res?.data?.booking;
      if (!booking) throw new Error('Không thể cập nhật trạng thái thanh toán');
      setIsSuccess(true);
      showToast('Thanh toán cọc thành công!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || err?.message || 'Thanh toán thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(null);
    return undefined;
  }, [file]);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        const res = await getBookingById(bookingId);
        const booking = res?.data?.booking;
        if (booking && booking.vendor) {
          setVendorBank({
            accountHolderName: booking.vendor.accountHolderName,
            accountNumber: booking.vendor.accountNumber,
            bankName: booking.vendor.bankName
          });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [bookingId]);

  const renderWaitingScreen = () => (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card rounded-3xl p-10 text-center border border-white/10">
        <div className="mb-6">
          <p className="text-lg font-semibold text-white">Yêu cầu đặt lịch đã được gửi</p>
          <p className="mt-3 text-slate-400">Vui lòng chờ nhà cung cấp chấp nhận yêu cầu. Sau khi được duyệt, bạn sẽ có thể thanh toán cọc.</p>
        </div>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span>Mã booking</span>
            <span className="font-medium text-white">{bookingId}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span>Trạng thái</span>
            <span className="font-medium text-amber-300">{bookingStatus || 'Đang xử lý'}</span>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all cyan-glow"
        >
          Làm mới trạng thái
        </button>
      </div>
    </div>
  );

  const renderConfirmedScreen = () => (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card rounded-3xl p-10 text-center border border-white/10">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <p className="text-lg font-semibold text-white">Booking đã được xác nhận</p>
          <p className="mt-3 text-slate-400">Bạn đã hoàn tất thanh toán cọc và booking đã xác nhận.</p>
        </div>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span>Mã booking</span>
            <span className="font-medium text-white">{bookingId}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span>Trạng thái</span>
            <span className="font-medium text-emerald-300">Đã xác nhận</span>
          </div>
        </div>
        <button
          onClick={() => window.location.assign('/')}
          className="mt-8 w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all cyan-glow"
        >
          Về Trang Chủ
        </button>
      </div>
    </div>
  );

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-card rounded-3xl p-10 text-center border border-white/10">
          <p className="text-white font-semibold">Không tìm thấy booking.</p>
          <p className="text-slate-400 mt-3">Vui lòng quay lại trang trước để gửi lại yêu cầu.</p>
        </div>
      </div>
    );
  }

  if (bookingStatus === 'pending') {
    return renderWaitingScreen();
  }

  if (bookingStatus === 'confirmed') {
    return renderConfirmedScreen();
  }

  if (isSuccess) {
    return renderConfirmedScreen();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setMethod('bank')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
            method === 'bank'
              ? 'bg-primary/10 border-primary cyan-glow'
              : 'glass-card border-white/10 hover:border-white/30'
          }`}
        >
          <Landmark className={`w-6 h-6 ${method === 'bank' ? 'text-primary' : 'text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${method === 'bank' ? 'text-primary' : 'text-slate-400'}`}>Chuyển Khoản</span>
        </button>
        <button
          onClick={() => setMethod('card')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
            method === 'card'
              ? 'bg-primary/10 border-primary cyan-glow'
              : 'glass-card border-white/10 hover:border-white/30'
          }`}
        >
          <CreditCard className={`w-6 h-6 ${method === 'card' ? 'text-primary' : 'text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${method === 'card' ? 'text-primary' : 'text-slate-400'}`}>Thẻ Tín Dụng</span>
        </button>
        <button
          onClick={() => setMethod('ewallet')}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
            method === 'ewallet'
              ? 'bg-primary/10 border-primary cyan-glow'
              : 'glass-card border-white/10 hover:border-white/30'
          }`}
        >
          <QrCode className={`w-6 h-6 ${method === 'ewallet' ? 'text-primary' : 'text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${method === 'ewallet' ? 'text-primary' : 'text-slate-400'}`}>Ví Điện Tử</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {method === 'bank' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-2xl p-6 border border-white/10"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 bg-white rounded-xl p-2 shrink-0 flex items-center justify-center">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Ngân hàng</label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-white font-medium">{vendorBank?.bankName || '---'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Số tài khoản</label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 flex justify-between items-center border border-white/5 group">
                    <span className="text-white font-mono text-lg tracking-wider">{vendorBank?.accountNumber || '---'}</span>
                    <button className="text-primary hover:text-white transition-colors p-1" onClick={() => {
                      if (vendorBank?.accountNumber) {
                        navigator.clipboard?.writeText(vendorBank.accountNumber);
                        showToast('Sao chép số tài khoản', 'success');
                      }
                    }}>
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Chủ tài khoản</label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-white font-medium">{vendorBank?.accountHolderName || '---'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Nội dung chuyển khoản</label>
                  <div className="bg-primary/10 rounded-lg px-4 py-3 flex justify-between items-center border border-primary/30">
                    <span className="text-primary font-mono font-bold">SW8892A</span>
                    <button className="text-primary hover:text-white transition-colors p-1">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
                  <p className="text-sm text-slate-300"><span className="font-bold text-primary">Tải lên</span> hoặc kéo thả biên lai</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF (Max. 5MB)</p>
                </div>
                <input ref={inputRef} type="file" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                }} />
              </label>

              {previewUrl && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                    <ImageIcon className="w-4 h-4 text-cyan" /> Xem trước biên lai
                  </div>
                  <img src={previewUrl} alt="Preview receipt" className="w-full max-h-64 object-contain rounded-xl border border-white/10 bg-black/20" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <button
          onClick={handleConfirm}
          disabled={loading || bookingStatus !== 'waiting_deposit'}
          className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all cyan-glow disabled:opacity-60"
        >
          {loading ? 'Đang gửi biên lai...' : 'Thanh toán cọc'}
        </button>
        {bookingStatus !== 'waiting_deposit' && (
          <button onClick={() => window.location.reload()} className="w-full py-3 border rounded-xl text-sm">Làm mới trạng thái</button>
        )}
      </div>
    </div>
  );
}
