import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin } from 'lucide-react';

const services = [
  {
    category: 'Tiệc sinh nhật',
    title: 'Balloon Fantasy',
    vendor: 'Glow Decor',
    rating: 4.9,
    reviews: 128,
    price: 'Từ 15M',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80&auto=format&fit=crop',
    tag: '🎂 Phổ biến nhất',
    tagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    accent: 'from-amber-500/40'
  },
  {
    category: 'Tiệc doanh nghiệp',
    title: 'Executive Gala Night',
    vendor: 'Lumina Events',
    rating: 5.0,
    reviews: 97,
    price: 'Từ 80M',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80&auto=format&fit=crop',
    tag: '🏆 Top đánh giá',
    tagColor: 'bg-cyan/20 text-cyan border-cyan/30',
    accent: 'from-cyan/40'
  },
  {
    category: 'Hội nghị & Workshop',
    title: 'Tech Summit 2025',
    vendor: 'Future Stage',
    rating: 4.8,
    reviews: 64,
    price: 'Từ 50M',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&auto=format&fit=crop',
    tag: '⚡ Mới nhất',
    tagColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
    accent: 'from-purple-500/40'
  },
];

export default function FeaturedServices({ navigate }: { navigate: (page: string, params?: any) => void }) {
  return (
    <section className="py-28 px-6 lg:px-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-cyan text-xs font-bold uppercase tracking-[0.3em] mb-4 block"
          >
            Được yêu thích nhất
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-serif italic text-white"
          >
            Dịch Vụ Nổi Bật
          </motion.h2>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onClick={() => navigate('vendor-list')}
          className="flex items-center gap-2 text-sm font-bold text-cyan hover:text-white transition-colors group whitespace-nowrap"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            onClick={() => navigate('vendor-list')}
            className="group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-cyan/40 bg-white/[0.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 flex flex-col"
          >
            {/* Image */}
            <div className="relative h-60 overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${service.accent} via-navy/60 to-transparent`} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />

              {/* Category + Tag */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                  {service.category}
                </span>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold backdrop-blur-md ${service.tagColor}`}>
                  {service.tag}
                </span>
              </div>

              {/* Price Float */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-cyan text-navy text-sm font-black rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                {service.price}
              </div>
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col gap-4 flex-grow">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan transition-colors mb-1">{service.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-silver/70">
                  <MapPin className="w-3.5 h-3.5 text-cyan" />
                  <span>{service.vendor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${service.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-silver/20'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-silver/60">{service.rating} ({service.reviews})</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
                  Xem thêm <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
