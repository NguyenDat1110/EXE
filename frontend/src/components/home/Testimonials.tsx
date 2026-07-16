import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nguyễn Thị Mai',
    title: 'Giám đốc Marketing, FPT Corp',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
    rating: 5,
    quote: 'ClickPick đã giúp chúng tôi tổ chức sự kiện Year End Party cho 500 nhân viên một cách hoàn hảo. Quy trình booking siêu nhanh, vendor rất chuyên nghiệp!',
    event: 'Year End Party 2024',
    highlight: true,
  },
  {
    name: 'Trần Minh Khoa',
    title: 'Founder, VinStart',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khoa',
    rating: 5,
    quote: 'Lần đầu tổ chức sự kiện lớn mà không bị stress chút nào. Nền tảng minh bạch, hỗ trợ 24/7 và vendor thực sự giỏi.',
    event: 'Product Launch Gala',
    highlight: false,
  },
  {
    name: 'Phạm Linh Chi',
    title: 'Mẹ bỉm sữa, Hà Nội',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chi',
    rating: 5,
    quote: 'Sinh nhật của bé được decor đẹp hơn tôi tưởng tượng. Giá hợp lý, vendor tận tâm. Chắc chắn quay lại năm sau!',
    event: 'Birthday Party Concept',
    highlight: false,
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6 lg:px-20 max-w-7xl mx-auto w-full relative">
      {/* Ambient */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />

      {/* Header */}
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-cyan text-xs font-bold uppercase tracking-[0.3em] mb-4 block"
        >
          Khách hàng nói gì
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-serif italic text-white"
        >
          Câu Chuyện Thành Công
        </motion.h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`relative p-8 rounded-3xl flex flex-col ${
              t.highlight
                ? 'bg-gradient-to-br from-cyan/10 via-white/[0.03] to-purple-500/10 border border-cyan/30 shadow-[0_0_50px_rgba(0,212,255,0.1)]'
                : 'glass-panel border border-white/10'
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-8 px-4 py-1 bg-cyan text-navy text-xs font-black uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                ⭐ Nổi bật
              </div>
            )}

            {/* Quote Icon */}
            <Quote className="w-10 h-10 text-cyan/20 mb-6" />

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-silver/20'}`} />
              ))}
            </div>

            {/* Quote */}
            <p className="text-silver/90 leading-relaxed text-base italic flex-grow mb-6">
              "{t.quote}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10 bg-slate-custom" />
              <div>
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-xs text-silver/60 mt-0.5">{t.title}</p>
              </div>
            </div>

            {/* Event Tag */}
            <div className="mt-4 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-silver/60 font-medium">
              📅 {t.event}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-8 text-silver/40 text-sm"
      >
        {['🔐 Thanh toán bảo mật', '✅ Vendor được xác minh', '📞 Hỗ trợ 24/7', '💯 Hoàn tiền nếu không hài lòng'].map((badge) => (
          <span key={badge} className="flex items-center gap-2 font-semibold">{badge}</span>
        ))}
      </motion.div>
    </section>
  );
}
