import { Shield, Star, MapPin, Globe, Phone } from 'lucide-react';
import PackageList from './PackageList';
import MiniCalendar from './MiniCalendar';

export default function VendorInfo({ navigate, vendorId }: { navigate: (page: string, params?: any) => void, vendorId: any }) {
  return (
    <div className="sticky top-24 glass-card rounded-2xl p-6 lg:p-8 h-fit">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif italic text-white mb-2">Lumina Events</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium border border-primary/20">
              <Shield className="w-3 h-3" /> Đã Xác Thực
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">4.9</span>
              <span className="text-slate-400 font-normal">(128 đánh giá)</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-300 leading-relaxed mb-6">
        Chuyên gia trong lĩnh vực thiết kế và thi công sự kiện cao cấp. Với hơn 5 năm kinh nghiệm, chúng tôi tự hào mang đến những không gian độc bản, kết hợp nghệ thuật sắp đặt và công nghệ ánh sáng tiên tiến.
      </p>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Quận 1, TP. Hồ Chí Minh</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Globe className="w-4 h-4 text-primary" />
          <a href="#" className="hover:text-primary transition-colors">luminaevents.vn</a>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Phone className="w-4 h-4 text-primary" />
          <span>090 123 4567</span>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full mb-6" />

      <PackageList navigate={navigate} vendorId={vendorId} />
      <MiniCalendar />

      {/* Mobile Sticky Bottom Bar - Hidden on desktop */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-card p-4 border-t border-white/10 flex items-center justify-between z-50">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Giá từ</span>
          <span className="text-lg font-bold text-primary">30.000.000đ</span>
        </div>
        <button 
          onClick={() => navigate('booking', { vendorId })}
          className="px-6 py-3 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-lg hover:brightness-110 transition-all cyan-glow"
        >
          Gửi Yêu Cầu
        </button>
      </div>
    </div>
  );
}
