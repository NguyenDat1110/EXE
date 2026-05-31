import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock3, MapPin, Users, ArrowRight } from 'lucide-react';

export default function BookingForm({
  onNext,
  blockedDates = [],
  packageName,
  packageMinParticipants,
  packageMaxParticipants
}: {
  onNext: (data: any) => void;
  blockedDates?: string[];
  packageName?: string;
  packageMinParticipants?: number;
  packageMaxParticipants?: number;
}) {
  const minGuests = Math.max(1, packageMinParticipants || 1);
  const maxGuests = packageMaxParticipants || 99999;

  const [guests, setGuests] = useState(minGuests);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const dateBlocked = !!selectedDate && blockedDateSet.has(selectedDate);
  const isValid = !!selectedDate && !!startTime && !!eventAddress.trim() && guests >= minGuests && guests <= maxGuests && !dateBlocked;

  const isBlockedDay = (day: Date) => blockedDateSet.has(format(day, 'yyyy-MM-dd'));
  const isPastDay = (day: Date) => isBefore(startOfDay(day), startOfDay(new Date()));

  const selectDate = (day: Date) => {
    if (isPastDay(day) || isBlockedDay(day)) return;
    setSelectedDate(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-lg font-serif text-white mb-4">Thông tin đặt lịch</h3>
        {packageName && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/10 p-5 mb-6">
            <p className="text-sm text-slate-400">Gói đã chọn</p>
            <p className="text-lg font-semibold text-white">{packageName}</p>
            <p className="text-xs text-slate-500 mt-2">Giá gói đã được xác định theo gói dịch vụ. Bạn chỉ cần chọn ngày và số khách để hoàn tất yêu cầu đặt lịch.</p>
            <p className="text-xs text-slate-500 mt-1">Số khách phù hợp: {minGuests} - {maxGuests} người.</p>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-slate-300">Chọn ngày tổ chức</p>
              <p className="text-xs text-slate-500 mt-1">Ngày xanh = còn trống, ngày đỏ = đã bận.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-white/20 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="min-w-32 text-center text-sm font-semibold text-white">{format(currentMonth, 'MM/yyyy')}</div>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-white/20 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const blocked = isBlockedDay(day);
              const past = isPastDay(day);
              const selected = selectedDate ? isSameDay(day, new Date(`${selectedDate}T00:00:00`)) : false;
              const outsideMonth = day.getMonth() !== currentMonth.getMonth();
              const available = !blocked && !past && !outsideMonth;

              let cellClass = 'border-white/10 bg-white/5 text-slate-500';
              if (outsideMonth) cellClass = 'border-transparent bg-transparent text-transparent pointer-events-none';
              else if (past) cellClass = 'border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed';
              else if (blocked) cellClass = 'border-red-500/30 bg-red-500/15 text-red-200 cursor-not-allowed';
              else if (selected) cellClass = 'border-primary/40 bg-primary/20 text-white shadow-[0_0_0_1px_rgba(0,255,255,0.2)]';
              else if (available) cellClass = 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 cursor-pointer';

              if (isToday(day) && !blocked) {
                cellClass += ' ring-1 ring-white/25';
              }

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDate(day)}
                  disabled={!available}
                  className={`aspect-square rounded-xl border text-sm font-medium transition-colors ${cellClass}`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500/25 border border-emerald-500/50" />
              <span>Còn trống</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/25 border border-red-500/50" />
              <span>Đã bận</span>
            </div>
          </div>

          {selectedDate && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
              Ngày đã chọn: <span className="font-semibold text-primary">{selectedDate}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ngày Tổ Chức</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={selectedDate}
                readOnly
                placeholder="Chọn ngày trên calendar phía trên"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {dateBlocked && (
              <p className="mt-2 text-xs text-rose-300">Ngày này đã có đơn đặt trước. Vui lòng chọn ngày khác.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
              <span>Số Lượng Khách</span>
              <span className="text-primary font-bold">{guests} khách</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={minGuests}
                max={maxGuests}
                step="1"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <p className="mt-2 text-xs text-slate-500">Nhập trực tiếp số khách, trong khoảng {minGuests} - {maxGuests} người.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Thời Gian Bắt Đầu</label>
            <div className="relative">
              <Clock3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Địa Chỉ Tổ Chức Sự Kiện</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={eventAddress}
              onChange={(e) => setEventAddress(e.target.value)}
              placeholder="Nhập địa chỉ tổ chức sự kiện"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/10 p-5">
          <p className="text-sm text-slate-400">Bạn không cần nhập ngân sách vì giá gói đã được xác định sẵn. Nếu có nhu cầu thay đổi dịch vụ, vui lòng ghi chú bên dưới hoặc trao đổi trực tiếp với vendor sau khi booking được gửi.</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Ghi Chú Thêm (Tùy chọn)</label>
          <textarea
            rows={4}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Mô tả thêm về ý tưởng, màu sắc chủ đạo, hoặc yêu cầu đặc biệt..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-navy/80 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white mb-2">Chú thích:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500/25 border border-emerald-500/50" />
            <span>Ngày xanh = còn trống</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/25 border border-red-500/50" />
            <span>Ngày đỏ = đã bận</span>
          </div>
        </div>
      </div>

      <button
        disabled={!isValid}
        onClick={() => onNext({ guests, date: selectedDate, startTime, eventAddress, specialRequests })}
        className="w-full py-4 bg-primary text-background-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cyan-glow"
      >
        Tiếp Tục <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
