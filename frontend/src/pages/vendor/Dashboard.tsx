import React, { useState, useEffect } from 'react';
import { Package, Calendar, Star, DollarSign } from 'lucide-react';
import BookingTable from '../../components/vendor-dashboard/BookingTable';
import { getVendorStats } from '../../services/vendorApi';
import { getMyPackages } from '../../services/packagesApi';

export default function VendorDashboard({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [stats, setStats] = useState<any>(null);
  const [activePackages, setActivePackages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pkgs] = await Promise.all([
          getVendorStats(),
          getMyPackages()
        ]);
        setStats(statsRes.stats);
        if (pkgs?.data) {
          setActivePackages(pkgs.data.filter((p: any) => p.isActive !== false).length);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Vendor Dashboard</h1>
        <p className="text-silver/60 mt-1">Quản lý các gói dịch vụ, đơn đặt và đánh giá từ khách hàng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4 animate-pulse">
                <div className="p-3 bg-white/10 rounded-xl w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-20" />
                  <div className="h-6 bg-white/10 rounded w-28" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-silver/60 text-xs uppercase tracking-wider">Gói Dịch Vụ</p>
                <p className="text-2xl font-bold font-sans mt-1">{activePackages} Đang mở</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-silver/60 text-xs uppercase tracking-wider">Booking Chờ Duyệt</p>
                <p className="text-2xl font-bold font-sans mt-1">{stats?.pendingBookings ?? 0}</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-silver/60 text-xs uppercase tracking-wider">Đánh giá trung bình</p>
                <p className="text-2xl font-bold font-sans mt-1">
                  {stats?.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : 'Chưa có'}
                </p>
                {stats?.reviewCount > 0 && (
                  <p className="text-silver/40 text-xs mt-0.5">{stats.reviewCount} đánh giá</p>
                )}
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-silver/60 text-xs uppercase tracking-wider">Doanh thu tháng này</p>
                <p className="text-2xl font-bold font-sans mt-1">{formatCurrency(stats?.monthlyRevenue ?? 0)}</p>
              </div>
            </div>
          </>
        )}
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
