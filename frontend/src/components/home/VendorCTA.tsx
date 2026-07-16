import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const benefits = [
  'Tiếp cận hàng ngàn khách hàng tiềm năng B2B & B2C',
  'Quản lý lịch trình và booking real-time',
  'Công cụ tạo báo giá và hợp đồng tự động',
  'Đảm bảo thanh toán an toàn qua nền tảng',
  'Hỗ trợ hiển thị mô hình 3D/360° cho concept',
];

const vendorStats = [
  { icon: Users, value: '500+', label: 'Vendor tin cậy' },
  { icon: TrendingUp, value: '3x', label: 'Tăng doanh thu' },
  { icon: Shield, value: '100%', label: 'Thanh toán bảo đảm' },
  { icon: Zap, value: '24h', label: 'Phê duyệt nhanh' },
];

export default function VendorCTA({ navigate }: { navigate: (page: string, params?: any) => void }) {
  const routerNavigate = useNavigate();

  return (
    <section className="py-28 px-6 lg:px-20 max-w-7xl mx-auto w-full">
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-custom to-navy" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan/15 rounded-full blur-[180px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 lg:p-16 items-center">
          {/* Left */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-xs font-bold uppercase tracking-[0.3em] mb-6"
            >
              <Zap className="w-3 h-3" /> Dành cho đối tác
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-serif italic text-white mb-6 leading-tight"
            >
              Trở Thành Vendor<br />Của <span className="text-cyan drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]">CLICKPICK</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-silver/80 mb-8 leading-relaxed text-lg"
            >
              Mở rộng quy mô kinh doanh và nâng tầm thương hiệu với nền tảng quản lý sự kiện chuyên nghiệp nhất Việt Nam.
            </motion.p>

            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-3 text-silver/90"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* Vendor Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {vendorStats.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass-panel p-4 rounded-2xl text-center hover:border-cyan/40 transition-colors"
                >
                  <Icon className="w-5 h-5 text-cyan mx-auto mb-2" />
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[10px] text-silver/60 uppercase tracking-wider mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan/30 via-purple-500/20 to-cyan/30 rounded-3xl blur-xl opacity-60" />
              <div className="relative bg-navy/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2">Bắt đầu miễn phí</h3>
                <p className="text-silver/60 text-sm mb-8">Không cần thẻ tín dụng. Dùng thử ngay hôm nay.</p>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    routerNavigate('/register');
                  }}
                >
                  <div>
                    <label className="block text-xs text-silver/60 uppercase tracking-wider mb-2 font-semibold">Tên doanh nghiệp</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan/60 focus:bg-white/10 transition-all placeholder:text-silver/30 text-sm"
                      placeholder="VD: Lumina Events"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-silver/60 uppercase tracking-wider mb-2 font-semibold">Số điện thoại</label>
                    <input
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan/60 focus:bg-white/10 transition-all placeholder:text-silver/30 text-sm"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-silver/60 uppercase tracking-wider mb-2 font-semibold">Lĩnh vực</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan/60 transition-all appearance-none text-sm cursor-pointer">
                      <option value="" className="bg-navy">Chọn lĩnh vực...</option>
                      <option value="decor" className="bg-navy">Trang trí sự kiện</option>
                      <option value="av" className="bg-navy">Âm thanh ánh sáng</option>
                      <option value="venue" className="bg-navy">Địa điểm</option>
                      <option value="catering" className="bg-navy">Ẩm thực & Tiệc</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-cyan text-navy font-black uppercase tracking-widest text-sm rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                  >
                    Đăng ký ngay <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-xs text-silver/40 mt-4">
                  Đã có tài khoản?{' '}
                  <button onClick={() => navigate('vendor-dashboard')} className="text-cyan hover:underline font-semibold">
                    Đăng nhập
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
