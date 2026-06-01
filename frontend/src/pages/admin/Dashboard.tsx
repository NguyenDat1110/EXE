import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAdminDashboardStats } from '../../services/adminApi';
import { useAuthStore } from '../../store/authStore';

interface DashboardData {
  users: {
    total: number;
    customers: number;
    vendors: number;
  };
  vendors: {
    pending: number;
    approved: number;
    rejected: number;
  };
  bookings: {
    monthly: number;
  };
  revenue: {
    monthly: number;
  };
  growthChart: Array<{
    date: string;
    bookings: number;
  }>;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboardStats();
      setDashboardData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-8">
        <p className="text-slate-400">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Admin Dashboard</h1>
          <p className="text-silver/60 mt-1">Tổng quan quản trị hệ thống và kiểm duyệt.</p>
        </div>
        <div className="bg-cyan/10 border border-cyan/30 px-4 py-2 rounded-full flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan">Admin Mode</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Tổng thành viên</p>
            <p className="text-2xl font-bold font-sans mt-1">{dashboardData.users.total.toLocaleString('vi-VN')}</p>
            <p className="text-xs text-silver/40 mt-1">
              {dashboardData.users.customers} khách + {dashboardData.users.vendors} vendor
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/15 rounded-xl text-yellow-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Vendor chờ duyệt</p>
            <p className="text-2xl font-bold font-sans mt-1">{dashboardData.vendors.pending}</p>
            <p className="text-xs text-yellow-400/60 mt-1">
              ✓ {dashboardData.vendors.approved} | ✗ {dashboardData.vendors.rejected}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/15 rounded-xl text-purple-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Booking trong tháng</p>
            <p className="text-2xl font-bold font-sans mt-1">{dashboardData.bookings.monthly}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-green-500/15 rounded-xl text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Doanh thu tháng</p>
            <p className="text-xl font-bold font-sans mt-1">{formatCurrency(dashboardData.revenue.monthly)}</p>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Biểu Đồ Tăng Trưởng (7 Ngày Gần Nhất)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.growthChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
            <XAxis dataKey="date" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="#06B6D4" 
              strokeWidth={2}
              dot={{ fill: '#06B6D4' }}
              name="Booking"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Info Panel */}
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Thông Tin Tổng Quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan mb-3">👥 Người Dùng</h3>
            <div className="flex justify-between text-sm">
              <span className="text-silver/60">Tổng cộng:</span>
              <span className="text-white font-medium">{dashboardData.users.total.toLocaleString('vi-VN')} người</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-silver/60">Khách hàng:</span>
              <span className="text-white font-medium">{dashboardData.users.customers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-silver/60">Nhà cung cấp:</span>
              <span className="text-white font-medium">{dashboardData.users.vendors}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan mb-3">🏪 Nhà Cung Cấp</h3>
            <div className="flex justify-between text-sm">
              <span className="text-silver/60">Chờ duyệt:</span>
              <span className="text-yellow-400 font-medium">{dashboardData.vendors.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-silver/60">Đã phê duyệt:</span>
              <span className="text-green-400 font-medium">{dashboardData.vendors.approved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-silver/60">Bị từ chối:</span>
              <span className="text-red-400 font-medium">{dashboardData.vendors.rejected}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

