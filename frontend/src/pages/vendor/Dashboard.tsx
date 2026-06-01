import React from 'react';
import { Package, Star, Calendar, MessageSquare } from 'lucide-react';
import BookingTable from '../../components/vendor-dashboard/BookingTable';

export default function VendorDashboard({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Vendor Dashboard</h1>
        <p className="text-silver/60 mt-1">Quản lý các gói dịch vụ, đơn đặt và đánh giá từ khách hàng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Gói Dịch Vụ</p>
            <p className="text-2xl font-bold font-sans mt-1">6 Đang mở</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Booking Mới</p>
            <p className="text-2xl font-bold font-sans mt-1">4 Chờ duyệt</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Đánh giá trung bình</p>
            <p className="text-2xl font-bold font-sans mt-1">4.9 / 5</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Tin nhắn mới</p>
            <p className="text-2xl font-bold font-sans mt-1">18 Tin nhắn</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Trang Vendor Dashboard</h2>
        <p className="text-silver/70 leading-relaxed">
          Giao diện dành riêng cho tài khoản có quyền <code className="bg-white/10 px-2 py-1 rounded text-cyan font-mono text-xs">vendor</code>.
          Nơi đây giúp hiển thị các số liệu thống kê về đơn đặt dịch vụ sự kiện, quản lý các gói dịch vụ (Packages), lịch đặt hàng và giao tiếp với khách hàng.
        </p>
      </div>

      <BookingTable showToast={showToast} />
    </div>
  );
}
