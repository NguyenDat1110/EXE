import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1920&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=90&auto=format&fit=crop',
];

const TESTIMONIAL_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=dave',
];

const StatCard = ({ endValue, label, suffix = '' }: { endValue: number; label: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          let start = 0;
          const duration = 2000;
          const increment = endValue / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= endValue) {
              setCount(endValue);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [endValue, started]);

  return (
    <div ref={ref} className="text-center">
      <span className="text-4xl lg:text-5xl font-bold text-white block tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-sm text-silver/60 uppercase tracking-widest mt-2 block font-semibold">{label}</span>
    </div>
  );
};

export default function HeroSection({ navigate }: { navigate: (page: string, params?: any) => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const routerNavigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      {HERO_IMAGES.map((img, idx) => (
        <motion.div
          key={img}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${img})` }}
          animate={{ opacity: idx === currentImage ? 1 : 0, scale: idx === currentImage ? 1.05 : 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/60 via-transparent to-transparent z-10" />

      {/* Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan/15 rounded-full blur-[160px] pointer-events-none z-10 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none z-10" style={{ animationDelay: '1s' }} />

      {/* Image Dots Navigation */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`rounded-full transition-all duration-500 ${idx === currentImage ? 'w-8 h-2 bg-cyan' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>

      {/* Parallax Content */}
      <motion.div style={{ y, opacity }} className="relative z-20 max-w-7xl mx-auto px-6 w-full pt-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan/30 bg-cyan/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
            <span className="text-cyan text-xs font-bold uppercase tracking-[0.3em]">Nền tảng sự kiện hàng đầu Việt Nam</span>
          </motion.div>

          {/* Main Headline */}
          <div className="mb-8">
            {['Elevate Every', 'Event Into', 'An Experience'].map((line, lineIdx) => (
              <div key={lineIdx} className="overflow-hidden">
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: lineIdx * 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className={`block text-6xl lg:text-8xl font-serif italic leading-none tracking-tight ${
                    lineIdx === 1 ? 'text-cyan drop-shadow-[0_0_40px_rgba(0,212,255,0.4)]' : 'text-white'
                  }`}
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl text-silver/80 max-w-xl leading-relaxed mb-10 font-sans"
          >
            Kết nối với hàng trăm vendor uy tín, lên kế hoạch và đặt lịch sự kiện hoàn hảo — tất cả chỉ trong một nền tảng.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <button
              onClick={() => navigate('vendor-list')}
              className="group flex items-center gap-3 px-8 py-4 bg-cyan text-navy font-bold rounded-full text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_50px_rgba(0,212,255,0.6)]"
            >
              Khám Phá Ngay
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => routerNavigate('/register')}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-full text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-current" />
              Đăng ký miễn phí
            </button>
          </motion.div>

          {/* Social Proof Mini */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {TESTIMONIAL_AVATARS.map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-navy bg-slate-custom"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-silver/70 mt-0.5">
                <span className="text-white font-bold">2,000+</span> khách hàng hài lòng
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-navy/70 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          <StatCard endValue={500} label="Vendors" suffix="+" />
          <div className="pl-8">
            <StatCard endValue={5000} label="Sự kiện thành công" suffix="+" />
          </div>
          <div className="pl-8 hidden md:block">
            <StatCard endValue={98} label="Khách hàng hài lòng" suffix="%" />
          </div>
          <div className="pl-8 hidden md:block">
            <div className="text-center">
              <span className="text-4xl lg:text-5xl font-bold text-cyan block flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan animate-ping inline-block" />
                24/7
              </span>
              <span className="text-sm text-silver/60 uppercase tracking-widest mt-2 block font-semibold">Hỗ trợ booking</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
