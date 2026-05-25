import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Landmark, QrCode, Upload, CheckCircle2, Copy } from 'lucide-react';

export default function PaymentStep({ navigate, showToast }: { navigate: (page: string, params?: any) => void, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [method, setMethod] = useState<'bank' | 'card' | 'ewallet' | null>('bank');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = () => {
    setIsSuccess(true);
    showToast('Đặt cọc thành công!', 'success');
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/95 backdrop-blur-md p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Confetti effect placeholder */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-10 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" />
            <div className="absolute top-20 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-100" />
            <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-pink-500 rounded-full animate-ping delay-300" />
          </div>

          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 cyan-glow">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-serif italic text-white mb-2">Đặt Cọc Thành Công!</h2>
          <p className="text-slate-400 mb-6">Mã Booking: <strong className="text-primary">#SW-8892A</strong></p>
          
          <div className="glass-panel rounded-xl p-4 mb-8 text-left space-y-3 border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Vendor</span>
              <span className="text-white font-medium">Lumina Events</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ngày sự kiện</span>
              <span className="text-white font-medium">20/11/2024</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/10 pt-3 mt-3">
              <span className="text-slate-400">Đã thanh toán</span>
              <span className="text-primary font-bold">45.000.000đ</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('home')}
            className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all cyan-glow"
          >
            Về Trang Chủ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Payment Methods */}
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
              {/* QR Code */}
              <div className="w-48 h-48 bg-white rounded-xl p-2 shrink-0 flex items-center justify-center">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
              
              {/* Bank Details */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Ngân hàng</label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-white font-medium">Vietcombank (VCB)</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Số tài khoản</label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 flex justify-between items-center border border-white/5 group">
                    <span className="text-white font-mono text-lg tracking-wider">1029 3847 56</span>
                    <button className="text-primary hover:text-white transition-colors p-1">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest mb-1 block">Chủ tài khoản</label>
                  <div className="bg-white/5 rounded-lg px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-white font-medium">CÔNG TY TNHH CLICKPICK</span>
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
                <input type="file" className="hidden" />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleConfirm}
        className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all cyan-glow"
      >
        Xác Nhận Đã Thanh Toán
      </button>
    </div>
  );
}
