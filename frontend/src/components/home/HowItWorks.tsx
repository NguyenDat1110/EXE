import { motion } from 'framer-motion';
import { Search, CalendarCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Tìm Kiếm & Lựa Chọn',
    description: 'Khám phá các concept và vendor phù hợp với ngân sách và phong cách của bạn.'
  },
  {
    icon: CalendarCheck,
    title: 'Đặt Lịch & Thanh Toán',
    description: 'Kiểm tra lịch trống real-time, chốt hợp đồng và thanh toán cọc an toàn qua nền tảng.'
  },
  {
    icon: Sparkles,
    title: 'Trải Nghiệm Sự Kiện',
    description: 'Vendor chuẩn bị và thi công theo đúng cam kết. Bạn chỉ việc tận hưởng khoảnh khắc.'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface/50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif italic text-white mb-4">Quy Trình Đơn Giản</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Từ ý tưởng đến hiện thực chỉ trong 3 bước dễ dàng với sự hỗ trợ của công nghệ.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-6 relative group bg-background-dark">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon className="w-8 h-8 text-primary relative z-10" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-background-dark text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
