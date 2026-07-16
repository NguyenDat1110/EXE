import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';

const categories = ['Tất cả', 'Corporate', 'Birthday', '< 50M', '50M-100M', '> 100M'];

const events = [
  { id: 1, title: 'Gala Dinner 2024', vendor: 'Lumina Events', rating: 4.9, category: 'Corporate', budget: '120M VND', image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80&auto=format&fit=crop', size: 'large' },
  { id: 2, title: 'Sweet 16 Neon Party', vendor: 'Glow Decor', rating: 4.8, category: 'Birthday', budget: '45M VND', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80&auto=format&fit=crop', size: 'small' },
  { id: 3, title: 'Tech Summit Stage', vendor: 'Future Stage', rating: 5.0, category: 'Corporate', budget: '85M VND', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&auto=format&fit=crop', size: 'small' },
  { id: 4, title: 'Product Launch Night', vendor: 'Elite Productions', rating: 4.7, category: 'Corporate', budget: '150M VND', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop', size: 'small' },
  { id: 5, title: '1st Year Milestone', vendor: 'Tiny Tots Events', rating: 4.9, category: 'Birthday', budget: '30M VND', image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80&auto=format&fit=crop', size: 'small' },
  { id: 6, title: 'Year End Gala', vendor: 'Grandeur', rating: 4.8, category: 'Corporate', budget: '200M VND', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80&auto=format&fit=crop', size: 'large' },
];

export default function IdeaGallery({ navigate }: { navigate: (page: string, params?: any) => void }) {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="py-28 px-6 lg:px-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-cyan text-xs font-bold uppercase tracking-[0.3em] mb-4 block"
          >
            Lấy cảm hứng
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-serif italic text-white"
          >
            Khám Phá Concept<br />Sự Kiện
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === cat
                  ? 'bg-cyan text-navy shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                  : 'glass-card text-silver hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Masonry-like grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px]">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate('vendor-list')}
            onMouseEnter={() => setHovered(event.id)}
            onMouseLeave={() => setHovered(null)}
            className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-cyan/50 transition-all duration-500 ${
              event.size === 'large' ? 'md:col-span-2 md:row-span-2' : 'col-span-1 row-span-1'
            }`}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image})` }}
              animate={{ scale: hovered === event.id ? 1.08 : 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent opacity-90" />

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan/20 backdrop-blur-md border border-cyan/30 text-xs font-bold text-cyan">
                {event.budget}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan transition-colors">{event.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-silver/70">{event.vendor}</span>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold">{event.rating}</span>
                </div>
              </div>

              <motion.div
                animate={{ height: hovered === event.id ? 'auto' : 0, opacity: hovered === event.id ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-cyan text-sm font-bold">
                  Xem chi tiết <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
