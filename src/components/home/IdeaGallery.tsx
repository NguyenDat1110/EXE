import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const categories = ['Tất cả', 'Corporate', 'Birthday', '< 50M VND', '50M - 100M VND', '> 100M VND'];

const events = [
  {
    id: 1,
    title: 'Gala Dinner 2024',
    vendor: 'Lumina Events',
    rating: 4.9,
    category: 'Corporate',
    budget: '120M VND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp',
    size: 'large'
  },
  {
    id: 2,
    title: 'Sweet 16 Neon',
    vendor: 'Glow Decor',
    rating: 4.8,
    category: 'Birthday',
    budget: '45M VND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-a1GfhArV_6OIT-eU77u4aK2EmaD7_JXRXLU4Fy4ICqeAxbfFmJoFoZXKiHivg12PjhsZzhflKOIIiLrsP28gBFIvePI0--9F4HGdmEoKWs_CeshcN02dhH7gScnQFgqUDiAe4pGfGQFhsgW3k8Jr_cJ7WD1mzC_QtpcQLU9VEUmnbhYgorZQJkG1iIEZwcQ4jKc3a713dgu5-vYpBdQP8Jyn4oYBgp_D9Nbl-MlvD7YBooXEFPNqsdPV_nTOolu58XqbVt1fbOT',
    size: 'small'
  },
  {
    id: 3,
    title: 'Tech Summit',
    vendor: 'Future Stage',
    rating: 5.0,
    category: 'Corporate',
    budget: '85M VND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO942zfFetWifa-AMjmMD9U-ziMEIVYzDYKO7TemxNVxzJ0GKiVGgPOskcYFFGqpQrAoFpANxZHzcexy_RIfAzZEiI2R1aNq8WcY6DJIiahxNgYVpIP2GNTjeqnGq3xbKQvuCYmF7hM2Tzk90PR7_NIYL-uXnQQW-1TOPWafS4dXO3BdpYEU-JdDfUR3qWonNr0gWniiuq6OEaS-DHLKtchlVAI8WFVmIDkLWPv1aKVGW9yzq4NBMpnAlCp_3822O8GEs_3OcO0C25',
    size: 'small'
  },
  {
    id: 4,
    title: 'Product Launch',
    vendor: 'Elite Productions',
    rating: 4.7,
    category: 'Corporate',
    budget: '150M VND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSSdtH06b-33mo_UkMnC7Gt4nmeERhVsMTuwunstZSGQnE_CKzltg2a93wLbTYgP6ZIQA8scDmZ85fnNixfB0GQg9y3QhlpgPZyRC-uNKYHZPXLVs7JQ7Xs9aYavO6iEW8bSs5l3W78NCnsZm7ssH5e_LGf3fqadREGf5jhFwNOLF7OOlKK0BPSHWCuNjcCR12mV7ZgTqnzOgRWsBQWiOZNeR7UvVuCv4HLUuZM0liKTb2FMwgIN991JKLDUTuWY1x8IMHLRdakGzS',
    size: 'small'
  },
  {
    id: 5,
    title: '1st Year Milestone',
    vendor: 'Tiny Tots Events',
    rating: 4.9,
    category: 'Birthday',
    budget: '30M VND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_OYhVvyQSsbCQ4iHmmL5Xw0oYTLovxwHlMsTPxuuv9xGj2N-Lk5-W5C0X6MXlQUtPtbF9H7PXicjKEPr-KyN4kmHDrtYI0Xottda9hrBY3PEm_IXplI8VfUkXGnDrm5zk5NK6wOgnw0Tz29VeDjeZ8cmCjS6WYMM-DOH_XQnQ77lXC5BT2g6CCSoz6UhxjILgabC3ublJOOJJrkIT4-xQi19vALmqs0-WHfHjpQVfOe8QDk7-vFbnxaFvJxKCOTr6q4ON3lM9yOUp',
    size: 'small'
  },
  {
    id: 6,
    title: 'Year End Party',
    vendor: 'Grandeur',
    rating: 4.8,
    category: 'Corporate',
    budget: '200M VND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp',
    size: 'large'
  }
];

export default function IdeaGallery({ navigate }: { navigate: (page: string, params?: any) => void }) {
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-serif italic text-white mb-4">Khám Phá Concept Sự Kiện</h2>
          <p className="text-slate-400 max-w-xl">Duyệt qua hàng trăm concept độc đáo từ các vendor hàng đầu, được thiết kế riêng cho từng loại hình sự kiện.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeFilter === cat 
                  ? 'bg-primary/20 text-primary border border-primary/50 cyan-glow' 
                  : 'glass-card text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate('vendor-detail', { vendorId: event.id })}
            className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
              event.size === 'large' ? 'md:col-span-2 md:row-span-2' : 'col-span-1 row-span-1'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${event.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent opacity-80" />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-white">
                {event.category}
              </span>
              <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-primary">
                {event.budget}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-serif text-white mb-1 group-hover:-translate-y-2 transition-transform duration-300">{event.title}</h3>
              <div className="flex justify-between items-center group-hover:-translate-y-2 transition-transform duration-300 delay-75">
                <span className="text-sm text-slate-300">{event.vendor}</span>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{event.rating}</span>
                </div>
              </div>
              
              {/* Hover Button */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="block w-full py-2 bg-primary text-background-dark text-sm font-bold uppercase tracking-wider rounded-lg mt-3 text-center">
                  Xem Chi Tiết
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
