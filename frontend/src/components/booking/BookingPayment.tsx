import { CheckCircle2, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingPayment({ bookingData }: { bookingData: any }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'success'>('waiting');

  const amount = bookingData?.booking?.depositAmount || bookingData?.package?.depositAmount || Math.round((bookingData?.package?.price || 0) * 0.3);
  const bookingId = bookingData?.booking?._id || '';
  
  // Lấy 6 ký tự cuối của Booking ID làm mã đơn
  const shortId = bookingId ? bookingId.slice(-6).toUpperCase() : '000000';
  const transferContent = `CP ${shortId}`;

  const bankId = import.meta.env.VITE_SEPAY_BANK_ID || 'Sacombank';
  const accountNo = import.meta.env.VITE_SEPAY_ACCOUNT_NO || '040111579123';
  const accountName = import.meta.env.VITE_SEPAY_ACCOUNT_NAME || 'NGUYEN MINH HAI';

  // Dùng QR của SePay hoặc VietQR
  const qrUrl = `https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankId}&amount=${amount}&des=${transferContent}`;

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleCopy = () => {
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Giả lập polling hoặc chờ webhook (ở đây ta chỉ hiển thị giao diện, webhook sẽ update backend)
  // Trong thực tế, có thể dùng Socket.IO hoặc polling API để check trạng thái đơn hàng.

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-serif text-white">Thanh Toán Tiền Cọc</h3>
        <p className="text-slate-400">Vui lòng quét mã QR bên dưới để thanh toán tiền cọc. Hệ thống sẽ tự động xác nhận đơn hàng sau khi nhận được thanh toán.</p>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-primary/20 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* QR Code Section */}
        <div className="flex-1 w-full max-w-sm flex flex-col items-center bg-white p-6 rounded-2xl relative z-10">
          <img src={qrUrl} alt="Payment QR Code" className="w-full aspect-square object-contain" />
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-slate-800">Quét mã qua ứng dụng ngân hàng</p>
            <p className="text-xs text-slate-500 mt-1">Hỗ trợ mọi ngân hàng (VietQR)</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Ngân hàng</p>
              <p className="font-semibold text-white">{bankId}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Chủ tài khoản</p>
              <p className="font-semibold text-white uppercase">{accountName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Số tài khoản</p>
              <p className="font-semibold text-white font-mono text-lg">{accountNo}</p>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-primary/80 mb-1">Số tiền cần thanh toán</p>
              <p className="text-2xl font-bold text-primary">{formatVND(amount)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Nội dung chuyển khoản</p>
                <p className="font-semibold text-white font-mono text-lg">{transferContent}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                title="Sao chép nội dung"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-300" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <p className="text-sm text-slate-400 italic text-center">
          Chú ý: Bạn cần nhập chính xác <strong>nội dung chuyển khoản</strong> để hệ thống tự động xác nhận.
        </p>
        <button 
          onClick={() => navigate('/my-bookings')}
          className="px-8 py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cyan-glow w-full md:w-auto"
        >
          Hoàn tất & Kiểm tra lịch sử đơn <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
