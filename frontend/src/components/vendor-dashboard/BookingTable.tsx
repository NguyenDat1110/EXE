import { useEffect, useState, useCallback, useRef } from 'react';
import { Eye, X, CheckCircle2, XCircle, Calendar as CalendarIcon, Users, Wallet, FileText, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVendorBookings, acceptBooking, declineBooking, markVendorComplete, vendorConfirmDeposit, vendorRejectDeposit } from '../../services/bookingsApi';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Chờ duyệt</span>;
    case 'waiting_deposit':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Chờ thanh toán</span>;
    case 'confirmed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">Đã xác nhận</span>;
    case 'vendor_completed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Vendor đã hoàn thành</span>;
    case 'customer_completed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan/20 text-cyan border border-cyan/30">Chờ thanh toán còn lại</span>;
    case 'completed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Hoàn thành</span>;
    case 'cancelled':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">Đã hủy</span>;
    default:
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10">Đang xử lý</span>;
  }
};

export default function BookingTable({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositRejectReason, setDepositRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await getVendorBookings(params);
      setBookings(res?.data?.bookings || []);
      setTotal(res?.data?.total || 0);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (err: any) {
      showToastRef.current(err?.response?.data?.message || 'Không thể tải danh sách đơn sự kiện', 'error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery, dateFrom, dateTo]);

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    try {
      await acceptBooking(selectedBooking._id);
      showToast('Đã duyệt booking và gửi yêu cầu đặt cọc', 'success');
      setSelectedBooking(null);
      await loadBookings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể duyệt booking', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    try {
      await declineBooking(selectedBooking._id);
      showToast('Đã từ chối booking', 'error');
      setSelectedBooking(null);
      await loadBookings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể từ chối booking', 'error');
    }
  };

  const handleVendorComplete = async () => {
    if (!selectedBooking) return;
    try {
      await markVendorComplete(selectedBooking._id);
      showToast('Đã đánh dấu hoàn thành và thông báo cho khách hàng', 'success');
      setSelectedBooking(null);
      await loadBookings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể đánh dấu hoàn thành', 'error');
    }
  };

  const handleConfirmDeposit = async () => {
    if (!selectedBooking) return;
    try {
      await vendorConfirmDeposit(selectedBooking._id);
      showToast('Đã xác nhận biên lai cọc', 'success');
      setSelectedBooking(null);
      await loadBookings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể xác nhận biên lai', 'error');
    }
  };

  const handleRejectDeposit = async () => {
    if (!selectedBooking) return;
    if (!depositRejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối biên lai', 'error');
      return;
    }
    try {
      await vendorRejectDeposit(selectedBooking._id, depositRejectReason.trim());
      showToast('Đã từ chối biên lai cọc', 'success');
      setSelectedBooking(null);
      setDepositRejectReason('');
      await loadBookings();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể từ chối biên lai', 'error');
    }
  };

  const canVendorComplete = (booking: any) => {
    if (booking.status !== 'confirmed' || !booking.completionEligibleAt) return false;
    return new Date(booking.completionEligibleAt).getTime() <= Date.now();
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Danh sách đơn sự kiện</h3>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none"
              >
                <option value="all" className="bg-background-dark">Tất cả trạng thái</option>
                <option value="pending" className="bg-background-dark">Chờ duyệt</option>
                <option value="waiting_deposit" className="bg-background-dark">Chờ thanh toán</option>
                <option value="confirmed" className="bg-background-dark">Đã xác nhận</option>
                <option value="vendor_completed" className="bg-background-dark">Vendor hoàn thành</option>
                <option value="customer_completed" className="bg-background-dark">Chờ thanh toán còn lại</option>
                <option value="completed" className="bg-background-dark">Hoàn thành</option>
                <option value="cancelled" className="bg-background-dark">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm khách hàng..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="date-input bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
            <span className="text-slate-500 self-center">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="date-input bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Gói</th>
                <th className="p-4 font-medium">Ngày</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Số khách</th>
                <th className="p-4 font-medium">Ngân sách</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-white/10 rounded" style={{ width: j === 6 ? '24px' : j === 0 ? '140px' : j === 4 ? '100px' : '80px' }} />
                        {j === 0 && <div className="h-3 bg-white/10 rounded w-20 mt-2" />}
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-sm text-slate-400 text-center">Chưa có đơn sự kiện nào.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <td className="p-4">
                      <div className="font-medium text-white">{booking.package?.name || 'Booking mới'}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{booking.eventDate?.split('T')[0] || '-'}</td>
                    <td className="p-4 text-sm text-slate-300">{booking.customer?.name || booking.customerId?.name || '-'}</td>
                    <td className="p-4 text-sm text-slate-300">{booking.numberOfGuests}</td>
                    <td className="p-4 text-sm font-medium text-primary">{formatVND(booking.totalPrice || 0)}</td>
                    <td className="p-4"><StatusBadge status={booking.status} /></td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
          <span>Hiển thị {total > 0 ? `${from} - ${to}` : 0} / {total} đơn sự kiện</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  p === page ? 'bg-primary text-background-dark font-semibold' : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
                  <p className="text-sm text-slate-400">{selectedBooking._id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="flex justify-between items-center">
                  <StatusBadge status={selectedBooking.status} />
                  <span className="text-sm text-slate-400">Tạo lúc: {new Date(selectedBooking.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="glass-panel p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" /> Thông tin sự kiện
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500 mb-1">Tên gói</span>
                      <span className="text-white font-medium">{selectedBooking.package?.name || 'Gói dịch vụ'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Số khách</span>
                      <span className="text-white font-medium">{selectedBooking.numberOfGuests}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Ngày tổ chức</span>
                      <span className="text-white font-medium">{selectedBooking.eventDate?.split('T')[0] || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Địa điểm</span>
                      <span className="text-white font-medium">{selectedBooking.eventAddress || selectedBooking.booth?.name || 'Chưa xác định'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Giờ bắt đầu</span>
                      <span className="text-white font-medium">{selectedBooking.startTime || '--:--'}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" /> Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500 mb-1">Khách hàng</span>
                      <span className="text-white font-medium">{selectedBooking.customer?.name || selectedBooking.customerId || 'Khách hàng'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Số điện thoại</span>
                      <span className="text-white font-medium">{selectedBooking.customer?.phone || 'Không hiển thị'}</span>
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
                      <span className="text-white font-medium">{formatVND(selectedBooking.totalPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiền cọc yêu cầu</span>
                      <span className="text-primary font-bold">{formatVND(selectedBooking.depositAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-slate-400">Thanh toán sau khi hoàn thành sự kiện</span>
                      <span className="text-white font-medium">{formatVND(selectedBooking.remainingAmount || Math.max((selectedBooking.totalPrice || 0) - (selectedBooking.depositAmount || 0), 0))}</span>
                    </div>
                  </div>
                </div>

                {(selectedBooking.depositReceiptUrl || selectedBooking.finalReceiptUrl) && (
                  <div className="glass-panel p-5 rounded-xl space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-primary" /> Biên lai đã gửi
                    </h3>
                    {selectedBooking.depositReceiptUrl && (
                      <a href={selectedBooking.depositReceiptUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/10 overflow-hidden bg-white/[0.03] hover:border-cyan/50 transition-colors">
                        <img src={selectedBooking.depositReceiptUrl} alt="Deposit receipt" className="w-full max-h-56 object-cover" />
                        <div className="px-4 py-3 text-xs text-cyan">Xem biên lai cọc</div>
                      </a>
                    )}
                    {selectedBooking.finalReceiptUrl && (
                      <a href={selectedBooking.finalReceiptUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/10 overflow-hidden bg-white/[0.03] hover:border-cyan/50 transition-colors">
                        <img src={selectedBooking.finalReceiptUrl} alt="Final receipt" className="w-full max-h-56 object-cover" />
                        <div className="px-4 py-3 text-xs text-cyan">Xem biên lai thanh toán còn lại</div>
                      </a>
                    )}
                  </div>
                )}
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
              {selectedBooking.paymentStatus === 'deposit_pending' && (
                <div className="p-6 border-t border-white/10 bg-background-dark sticky bottom-0 space-y-3">
                  <textarea
                    value={depositRejectReason}
                    onChange={(e) => setDepositRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do từ chối biên lai..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleRejectDeposit}
                      className="flex-1 py-3 glass-card text-red-300 font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Từ chối biên lai
                    </button>
                    <button onClick={handleConfirmDeposit} className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all cyan-glow flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Xác nhận biên lai cọc
                    </button>
                  </div>
                </div>
              )}
              {selectedBooking.status === 'confirmed' && (
                <div className="p-6 border-t border-white/10 bg-background-dark sticky bottom-0">
                  {canVendorComplete(selectedBooking) ? (
                    <button onClick={handleVendorComplete} className="w-full py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all cyan-glow flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Đánh dấu hoàn thành
                    </button>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                      Chưa đến thời gian kết thúc dịch vụ để đánh dấu hoàn thành.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
