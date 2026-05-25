import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for availability
const bookedDates = [
  new Date(2024, 10, 15),
  new Date(2024, 10, 16),
  new Date(2024, 10, 20),
  new Date(2024, 10, 25),
];

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart; // In a real calendar, we'd pad the start to Sunday
  const endDate = monthEnd;

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const isBooked = (date: Date) => bookedDates.some(d => isSameDay(d, date));
  const isPast = (date: Date) => isBefore(startOfDay(date), startOfDay(new Date()));

  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Kiểm tra lịch trống</h3>
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-white font-medium">
            Tháng {format(currentDate, 'M, yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
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
            else if (booked) bgClass = "bg-red-500/20 text-red-300 cursor-not-allowed";
            else bgClass = "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 cursor-pointer";

            if (today) bgClass += " border border-primary";

            return (
              <div 
                key={i} 
                className={`aspect-square rounded-md flex items-center justify-center text-xs transition-colors ${bgClass}`}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            <span className="text-slate-400">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <span className="text-slate-400">Kín lịch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
