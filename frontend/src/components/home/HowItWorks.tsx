import { motion } from 'framer-motion';
import { Search, CalendarCheck, Sparkles, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Tìm Kiếm & Lựa Chọn',
    description: 'Khám phá hàng trăm vendor uy tín với concept đa dạng phù hợp ngân sách và phong cách của bạn.',
    color: 'text-cyan',
    glow: 'shadow-[0_0_40px_rgba(0,212,255,0.3)]',
    bg: 'bg-cyan/10 border-cyan/20',
  },
  {
    icon: CalendarCheck,
    step: '02',
    title: 'Đặt Lịch & Thanh Toán',
    description: 'Kiểm tra lịch trống real-time, xác nhận booking và thanh toán cọc an toàn 100% qua nền tảng.',
    color: 'text-purple-400',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Tận Hưởng Sự Kiện',
    description: 'Vendor chuẩn bị và thi công theo đúng cam kết. Bạn chỉ cần xuất hiện và tận hưởng khoảnh khắc.',
    color: 'text-amber-400',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3)]',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Bg */}
      <div className="absolute inset-0 bg-surface/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-cyan text-xs font-bold uppercase tracking-[0.3em] mb-4 block"
          >
            Quy trình của chúng tôi
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif italic text-white mb-6"
          >
            Chỉ 3 Bước Đơn Giản
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-silver/70 max-w-2xl mx-auto text-lg"
          >
            Từ ý tưởng đến sự kiện hoàn hảo — chúng tôi biến mọi thứ thành hiện thực.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-white/10 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan via-purple-400 to-amber-400"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 group"
            >
              <div className={`glass-panel p-8 rounded-3xl border ${step.bg} hover:scale-105 transition-transform duration-500 h-full flex flex-col`}>
                {/* Step Number */}
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 rounded-2xl ${step.bg} border flex items-center justify-center ${step.glow} group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <span className="text-7xl font-black text-white/5 leading-none select-none">{step.step}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-silver/70 leading-relaxed flex-grow">{step.description}</p>

                <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${step.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Tìm hiểu thêm <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
