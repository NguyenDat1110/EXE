import { Info, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BookingSummary({ data, onNext, onBack }: { data: any, onNext: () => void, onBack: () => void }) {
  const pkg = data.package;
  const total = pkg?.price || 0;
  const deposit = pkg?.depositAmount ?? Math.round(total * 0.3);
  const remaining = total - deposit;

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Vendor Mini Card */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        <img src={data.package?.images?.[0] || data.vendor?.avatar || ''} alt={data.vendor?.name || 'Vendor'} className="w-20 h-20 rounded-xl object-cover" />
        <div>
          <h3 className="text-lg font-serif text-white">{data.vendor?.name || 'Nhà cung cấp'}</h3>
          <p className="text-sm text-primary font-medium">{pkg?.name}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{data.date || ''}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>{data.startTime || ''}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>{data.guests || ''} khách</span>
          </div>
        </div>
      </div>

      {/* Calculation Box */}
      <div className="glass-panel rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Chi Tiết Thanh Toán</h4>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-slate-300">
            <span>Tổng chi phí dự kiến</span>
            <span className="font-medium">{formatVND(total)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Phí dịch vụ nền tảng (0%)</span>
            <span className="font-medium">Miễn phí</span>
          </div>
        </div>

        <div className="h-px bg-white/10 w-full mb-6" />

        <div className="flex justify-between items-end mb-2">
          <span className="text-white font-medium">Số tiền cọc (30%)</span>
          <span className="text-3xl font-bold text-primary cyan-glow">{formatVND(deposit)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>Thanh toán phần còn lại vào ngày sự kiện</span>
          <span>{formatVND(remaining)}</span>
        </div>
      </div>

      {/* Policy */}
      <div className="glass-card rounded-xl p-4 flex items-start gap-3 border-white/5">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Bằng việc gửi yêu cầu, bạn đồng ý với <a href="#" className="text-primary hover:underline">Chính sách hủy & hoàn tiền</a> của CLICKPICK. Sau khi vendor duyệt, nút thanh toán cọc sẽ xuất hiện trong lịch sử booking.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button 
          onClick={onBack}
          className="px-6 py-4 glass-card text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay Lại
        </button>
        <button 
          onClick={onNext}
          className="flex-1 py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cyan-glow"
        >
          Gửi yêu cầu đặt lịch <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
