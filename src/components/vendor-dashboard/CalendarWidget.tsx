import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for availability
const bookedDates = [
  new Date(2024, 10, 15),
  new Date(2024, 10, 16),
  new Date(2024, 10, 20),
  new Date(2024, 10, 25),
];

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const isBooked = (date: Date) => bookedDates.some(d => isSameDay(d, date));
  const isPast = (date: Date) => isBefore(startOfDay(date), startOfDay(new Date()));

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Lịch Trình</h3>
      
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <span className="text-white font-medium">
          Tháng {format(currentDate, 'M, yyyy')}
        </span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Padding for first day of month */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        
        {days.map((day, i) => {
          const past = isPast(day);
          const booked = isBooked(day);
          const today = isToday(day);
          
          let bgClass = "bg-white/5 text-slate-300 hover:bg-white/10";
          if (past) bgClass = "bg-transparent text-slate-600 cursor-not-allowed";
          else if (booked) bgClass = "bg-primary/20 text-primary border border-primary/30 cyan-glow cursor-pointer";
          else bgClass = "bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer";

          if (today && !booked) bgClass += " border border-white/30";

          return (
            <div 
              key={i} 
              className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors relative group ${bgClass}`}
            >
              {format(day, 'd')}
              {booked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background-dark text-white text-xs rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  1 Booking
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white/5 border border-white/20" />
          <span className="text-slate-400">Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/50" />
          <span className="text-slate-400">Kín lịch</span>
        </div>
      </div>
    </div>
  );
}
