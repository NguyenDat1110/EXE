import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Box } from 'lucide-react';

const images = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-a1GfhArV_6OIT-eU77u4aK2EmaD7_JXRXLU4Fy4ICqeAxbfFmJoFoZXKiHivg12PjhsZzhflKOIIiLrsP28gBFIvePI0--9F4HGdmEoKWs_CeshcN02dhH7gScnQFgqUDiAe4pGfGQFhsgW3k8Jr_cJ7WD1mzC_QtpcQLU9VEUmnbhYgorZQJkG1iIEZwcQ4jKc3a713dgu5-vYpBdQP8Jyn4oYBgp_D9Nbl-MlvD7YBooXEFPNqsdPV_nTOolu58XqbVt1fbOT',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCO942zfFetWifa-AMjmMD9U-ziMEIVYzDYKO7TemxNVxzJ0GKiVGgPOskcYFFGqpQrAoFpANxZHzcexy_RIfAzZEiI2R1aNq8WcY6DJIiahxNgYVpIP2GNTjeqnGq3xbKQvuCYmF7hM2Tzk90PR7_NIYL-uXnQQW-1TOPWafS4dXO3BdpYEU-JdDfUR3qWonNr0gWniiuq6OEaS-DHLKtchlVAI8WFVmIDkLWPv1aKVGW9yzq4NBMpnAlCp_3822O8GEs_3OcO0C25'
];

const gridImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDSSdtH06b-33mo_UkMnC7Gt4nmeERhVsMTuwunstZSGQnE_CKzltg2a93wLbTYgP6ZIQA8scDmZ85fnNixfB0GQg9y3QhlpgPZyRC-uNKYHZPXLVs7JQ7Xs9aYavO6iEW8bSs5l3W78NCnsZm7ssH5e_LGf3fqadREGf5jhFwNOLF7OOlKK0BPSHWCuNjcCR12mV7ZgTqnzOgRWsBQWiOZNeR7UvVuCv4HLUuZM0liKTb2FMwgIN991JKLDUTuWY1x8IMHLRdakGzS',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_OYhVvyQSsbCQ4iHmmL5Xw0oYTLovxwHlMsTPxuuv9xGj2N-Lk5-W5C0X6MXlQUtPtbF9H7PXicjKEPr-KyN4kmHDrtYI0Xottda9hrBY3PEm_IXplI8VfUkXGnDrm5zk5NK6wOgnw0Tz29VeDjeZ8cmCjS6WYMM-DOH_XQnQ77lXC5BT2g6CCSoz6UhxjILgabC3ublJOOJJrkIT4-xQi19vALmqs0-WHfHjpQVfOe8QDk7-vFbnxaFvJxKCOTr6q4ON3lM9yOUp',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-a1GfhArV_6OIT-eU77u4aK2EmaD7_JXRXLU4Fy4ICqeAxbfFmJoFoZXKiHivg12PjhsZzhflKOIIiLrsP28gBFIvePI0--9F4HGdmEoKWs_CeshcN02dhH7gScnQFgqUDiAe4pGfGQFhsgW3k8Jr_cJ7WD1mzC_QtpcQLU9VEUmnbhYgorZQJkG1iIEZwcQ4jKc3a713dgu5-vYpBdQP8Jyn4oYBgp_D9Nbl-MlvD7YBooXEFPNqsdPV_nTOolu58XqbVt1fbOT'
];

export default function VendorVisuals({ onOpen360 }: { onOpen360: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero Carousel */}
      <div className="relative w-full aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>

        {/* 360 Button */}
        <button 
          onClick={onOpen360}
          className="absolute bottom-6 left-6 px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/50 text-primary rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-wider cyan-glow hover:bg-primary/30 transition-colors"
        >
          <Box className="w-4 h-4" />
          Xem Mô Hình 360°
        </button>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 gap-4 space-y-4">
        {gridImages.map((src, idx) => (
          <div key={idx} className="relative rounded-xl overflow-hidden group break-inside-avoid">
            <img 
              src={src} 
              alt={`Gallery ${idx}`} 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
