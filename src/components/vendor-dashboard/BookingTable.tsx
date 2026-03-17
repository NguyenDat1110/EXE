import { useState } from 'react';
import { Eye, X, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, Users, Wallet, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Chờ duyệt</span>;
    case 'deposited':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 cyan-glow">Đã cọc</span>;
    case 'completed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Hoàn thành</span>;
    case 'cancelled':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">Đã hủy</span>;
    default:
      return null;
  }
};

const mockBookings = [
  { id: 'SW-8892A', event: 'Gala Dinner Techcombank', date: '20/11/2024', guests: 200, budget: 150000000, status: 'pending', customer: 'Nguyễn Văn A', phone: '0901234567', package: 'Gói Siêu Cấp (Luxury)' },
  { id: 'SW-8893B', event: 'Sinh nhật bé Dâu', date: '25/11/2024', guests: 50, budget: 45000000, status: 'deposited', customer: 'Trần Thị B', phone: '0912345678', package: 'Gói Cơ Bản (Essential)' },
  { id: 'SW-8894C', event: 'Year End Party VNG', date: '15/12/2024', guests: 500, budget: 300000000, status: 'completed', customer: 'Lê Văn C', phone: '0923456789', package: 'Gói Siêu Cấp (Luxury)' },
  { id: 'SW-8895D', event: 'Kỷ niệm 10 năm cưới', date: '05/11/2024', guests: 100, budget: 80000000, status: 'cancelled', customer: 'Phạm Thị D', phone: '0934567890', package: 'Gói Cao Cấp (Premium)' },
];

export default function BookingTable({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleApprove = () => {
    setSelectedBooking(null);
    showToast('Đã duyệt booking và gửi yêu cầu đặt cọc', 'success');
  };

  const handleReject = () => {
    setSelectedBooking(null);
    showToast('Đã từ chối booking', 'error');
  };

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Danh Sách Booking</h3>
          <div className="flex gap-2">
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none">
              <option value="all" className="bg-background-dark">Tất cả trạng thái</option>
              <option value="pending" className="bg-background-dark">Chờ duyệt</option>
              <option value="deposited" className="bg-background-dark">Đã cọc</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Sự kiện</th>
                <th className="p-4 font-medium">Ngày</th>
                <th className="p-4 font-medium">Khách</th>
                <th className="p-4 font-medium">Ngân sách</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                  <td className="p-4">
                    <div className="font-medium text-white">{booking.event}</div>
                    <div className="text-xs text-slate-500">{booking.id}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{booking.date}</td>
                  <td className="p-4 text-sm text-slate-300">{booking.guests}</td>
                  <td className="p-4 text-sm font-medium text-primary">{formatVND(booking.budget)}</td>
                  <td className="p-4"><StatusBadge status={booking.status} /></td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
          <span>Hiển thị 1-4 trên 24 booking</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">Trước</button>
            <button className="px-3 py-1 rounded bg-primary text-background-dark font-medium">1</button>
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">2</button>
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">Sau</button>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-background-dark border-l border-white/10 z-50 shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">Chi tiết Booking</h2>
                  <p className="text-sm text-slate-400">{selectedBooking.id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="flex justify-between items-center">
                  <StatusBadge status={selectedBooking.status} />
                  <span className="text-sm text-slate-400">Tạo lúc: 10/10/2024 14:30</span>
                </div>

                <div className="glass-panel p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" /> Thông tin sự kiện
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500 mb-1">Tên sự kiện</span>
                      <span className="text-white font-medium">{selectedBooking.event}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Gói dịch vụ</span>
                      <span className="text-primary font-medium">{selectedBooking.package}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Ngày tổ chức</span>
                      <span className="text-white font-medium">{selectedBooking.date}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Số khách</span>
                      <span className="text-white font-medium">{selectedBooking.guests}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" /> Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500 mb-1">Họ tên</span>
                      <span className="text-white font-medium">{selectedBooking.customer}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Số điện thoại</span>
                      <span className="text-white font-medium">{selectedBooking.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl space-y-4 border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <h3 className="font-bold text-white flex items-center gap-2 mb-2 relative z-10">
                    <Wallet className="w-4 h-4 text-primary" /> Thanh toán
                  </h3>
                  <div className="space-y-2 text-sm relative z-10">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tổng ngân sách</span>
                      <span className="text-white font-medium">{formatVND(selectedBooking.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Đã cọc (30%)</span>
                      <span className="text-primary font-bold">{formatVND(selectedBooking.budget * 0.3)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-slate-400">Còn lại</span>
                      <span className="text-white font-medium">{formatVND(selectedBooking.budget * 0.7)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="p-6 border-t border-white/10 bg-background-dark sticky bottom-0 flex gap-3">
                  <button onClick={handleReject} className="flex-1 py-3 glass-card text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> Từ chối
                  </button>
                  <button onClick={handleApprove} className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all cyan-glow flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Duyệt & Nhận cọc
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
