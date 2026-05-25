import { useState } from 'react';
import { Building2, Cake, Calendar as CalendarIcon, Users, Wallet, ArrowRight } from 'lucide-react';

export default function BookingForm({ onNext }: { onNext: (data: any) => void }) {
  const [eventType, setEventType] = useState<'corporate' | 'birthday' | null>(null);
  const [guests, setGuests] = useState(50);
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');

  const isValid = eventType && guests > 0 && budget && date;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Event Type */}
      <div>
        <h3 className="text-lg font-serif text-white mb-4">Loại Hình Sự Kiện</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setEventType('corporate')}
            className={`p-6 rounded-2xl border text-left transition-all ${
              eventType === 'corporate' 
                ? 'bg-primary/10 border-primary cyan-glow' 
                : 'glass-card border-white/10 hover:border-white/30'
            }`}
          >
            <Building2 className={`w-8 h-8 mb-4 ${eventType === 'corporate' ? 'text-primary' : 'text-slate-400'}`} />
            <h4 className="text-white font-bold mb-1">Corporate</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Gala dinner, hội nghị, ra mắt sản phẩm</p>
          </button>
          
          <button
            onClick={() => setEventType('birthday')}
            className={`p-6 rounded-2xl border text-left transition-all ${
              eventType === 'birthday' 
                ? 'bg-primary/10 border-primary cyan-glow' 
                : 'glass-card border-white/10 hover:border-white/30'
            }`}
          >
            <Cake className={`w-8 h-8 mb-4 ${eventType === 'birthday' ? 'text-primary' : 'text-slate-400'}`} />
            <h4 className="text-white font-bold mb-1">Private</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Sinh nhật, kỷ niệm, tiệc cá nhân</p>
          </button>
        </div>
      </div>

      {/* Date & Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Ngày Tổ Chức</label>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
            <span>Số Lượng Khách</span>
            <span className="text-primary font-bold">{guests} khách</span>
          </label>
          <div className="relative h-12 flex items-center">
            <input 
              type="range" 
              min="10" 
              max="500" 
              step="10"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Ngân Sách Dự Kiến (VND)</label>
        <div className="relative">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="VD: 50,000,000"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Ghi Chú Thêm (Tùy chọn)</label>
        <textarea 
          rows={4}
          placeholder="Mô tả thêm về ý tưởng, màu sắc chủ đạo, hoặc yêu cầu đặc biệt..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <button 
        disabled={!isValid}
        onClick={() => onNext({ eventType, guests, budget, date })}
        className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cyan-glow"
      >
        Tiếp Tục <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
