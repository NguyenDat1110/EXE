import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const words = "Elevating Events with Precision and Luxury".split(" ");

const StatCard = ({ endValue, label, suffix = "" }: { endValue: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = endValue / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [endValue]);

  return (
    <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center min-w-[120px] cyan-glow">
      <span className="text-2xl font-bold text-primary font-sans">{count}{suffix}</span>
      <span className="text-xs text-slate-300 uppercase tracking-widest mt-1 text-center">{label}</span>
    </div>
  );
};

export default function HeroSection({ navigate }: { navigate: (page: string, params?: any) => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with blur and gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC_OYhVvyQSsbCQ4iHmmL5Xw0oYTLovxwHlMsTPxuuv9xGj2N-Lk5-W5C0X6MXlQUtPtbF9H7PXicjKEPr-KyN4kmHDrtYI0Xottda9hrBY3PEm_IXplI8VfUkXGnDrm5zk5NK6wOgnw0Tz29VeDjeZ8cmCjS6WYMM-DOH_XQnQ77lXC5BT2g6CCSoz6UhxjILgabC3ublJOOJJrkIT4-xQi19vALmqs0-WHfHjpQVfOe8QDk7-vFbnxaFvJxKCOTr6q4ON3lM9yOUp')",
          filter: "blur(4px)",
          transform: "scale(1.05)"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-background-dark/60 to-background-dark" />
      
      {/* Particles effect (CSS) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-6 block"
        >
          B2B2C Excellence
        </motion.span>
        
        <h1 className="text-5xl lg:text-7xl font-serif italic text-white leading-tight mb-6 max-w-4xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`inline-block mr-3 ${word === 'Precision' ? 'text-primary' : ''}`}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg text-slate-300 font-sans max-w-2xl leading-relaxed mb-10"
        >
          Vietnam's premier tech-integrated marketplace for corporate galas and prestigious private celebrations.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <button 
            onClick={() => navigate('vendor-list')}
            className="px-8 py-4 bg-primary text-background-dark font-bold rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-transform cyan-glow"
          >
            Book an Experience
          </button>
          <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-full uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
            View Reel
          </button>
        </motion.div>

        {/* Floating Stat Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <StatCard endValue={500} label="Vendor" suffix="+" />
          <StatCard endValue={98} label="Hài lòng" suffix="%" />
          <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center min-w-[120px] cyan-glow">
            <span className="text-2xl font-bold text-primary font-sans flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              24/7
            </span>
            <span className="text-xs text-slate-300 uppercase tracking-widest mt-1 text-center">Booking</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
