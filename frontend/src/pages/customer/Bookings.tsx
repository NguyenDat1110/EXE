import React from 'react';
import { CalendarDays, MapPin, DollarSign } from 'lucide-react';

export default function CustomerBookings() {
  const dummyBookings = [
    {
      id: 'BK-1002',
      vendorName: 'Lumina Events',
      packageName: 'Gói Siêu Cấp (Luxury)',
      date: '2026-06-15',
      price: '45,000,000đ',
      status: 'pending_payment',
      location: 'Hà Nội'
    },
    {
      id: 'BK-0987',
      vendorName: 'Phượng Hoàng Media',
      packageName: 'Trọn Gói Khai Trương',
      date: '2026-05-10',
      price: '18,500,000đ',
      status: 'confirmed',
      location: 'TP. Hồ Chí Minh'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Đơn Đặt Chỗ Của Tôi</h1>
        <p className="text-silver/60 mt-1">Quản lý lịch sử và trạng thái của các gói sự kiện đã đặt.</p>
      </div>

      <div className="space-y-4">
        {dummyBookings.map((b) => (
          <div key={b.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:border-cyan/45 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded font-mono text-cyan font-bold">{b.id}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  b.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {b.status === 'confirmed' ? 'Đã Xác Nhận' : 'Chờ Thanh Toán'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{b.vendorName}</h2>
              <p className="text-silver/80 text-sm font-medium">{b.packageName}</p>
              
              <div className="flex flex-wrap gap-4 text-xs text-silver/60 pt-2">
                <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-cyan" /> {b.date}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-cyan" /> {b.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-cyan" /> {b.price}</span>
              </div>
            </div>

            <div className="flex items-end justify-start md:justify-end">
              <button className="px-5 py-2.5 bg-cyan/15 hover:bg-cyan/25 border border-cyan/35 text-cyan hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300">
                Xem Chi Tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
