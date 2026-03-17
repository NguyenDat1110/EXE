import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const benefits = [
  'Tiếp cận hàng ngàn khách hàng tiềm năng B2B & B2C',
  'Quản lý lịch trình và booking real-time',
  'Công cụ tạo báo giá và hợp đồng tự động',
  'Đảm bảo thanh toán an toàn qua nền tảng',
  'Hỗ trợ hiển thị mô hình 3D/360° cho concept'
];

export default function VendorCTA({ navigate }: { navigate: (page: string, params?: any) => void }) {
  return (
    <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto w-full">
      <div className="glass-card rounded-3xl overflow-hidden relative border-primary/20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16 relative z-10 items-center">
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Dành Cho Đối Tác</span>
            <h2 className="text-4xl lg:text-5xl font-serif italic text-white mb-6 leading-tight">
              Trở Thành Vendor Của <span className="text-primary">CLICKPICK</span>
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Mở rộng quy mô kinh doanh và nâng tầm thương hiệu của bạn với nền tảng quản lý sự kiện chuyên nghiệp nhất Việt Nam.
            </p>
            
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-slate-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/10 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur opacity-30" />
            <div className="relative bg-background-dark/80 backdrop-blur-xl rounded-xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">Đăng Ký Tư Vấn</h3>
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate('vendor-dashboard');
                }}
              >
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Tên Doanh Nghiệp</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="VD: Lumina Events"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Số Điện Thoại</label>
                  <input 
                    type="tel" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="09xx xxx xxx"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Lĩnh Vực</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option value="" className="bg-background-dark">Chọn lĩnh vực...</option>
                    <option value="decor" className="bg-background-dark">Trang trí sự kiện</option>
                    <option value="av" className="bg-background-dark">Âm thanh ánh sáng</option>
                    <option value="venue" className="bg-background-dark">Địa điểm</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-6"
                >
                  Gửi Yêu Cầu <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
