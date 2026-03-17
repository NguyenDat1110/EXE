import { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  hasNotification = false,
  prefix = '',
  suffix = ''
}: { 
  title: string, 
  value: number, 
  icon: LucideIcon, 
  trend: 'up' | 'down' | 'neutral', 
  trendValue: string,
  hasNotification?: boolean,
  prefix?: string,
  suffix?: string
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    
    if (value === 0) return;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary relative">
          <Icon className="w-6 h-6" />
          {hasNotification && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
          )}
          {hasNotification && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        }`}>
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          {trendValue}
        </div>
      </div>
      
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-3xl font-bold text-white font-sans">
          {prefix}{count.toLocaleString('vi-VN')}{suffix}
        </div>
      </div>
      
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </div>
  );
}
