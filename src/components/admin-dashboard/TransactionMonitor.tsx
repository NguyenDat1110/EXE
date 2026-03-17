import { useState } from 'react';
import { Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import StatCard from '../vendor-dashboard/StatCard';
import { DollarSign, Activity, Clock } from 'lucide-react';

const mockTransactions = [
  { id: 'TRX-001', vendor: 'Lumina Events', customer: 'Nguyễn Văn A', package: 'Gói Siêu Cấp', amount: 45000000, date: '20/10/2024', status: 'completed' },
  { id: 'TRX-002', vendor: 'Glow Decor', customer: 'Trần Thị B', package: 'Gói Cơ Bản', amount: 15000000, date: '19/10/2024', status: 'pending' },
  { id: 'TRX-003', vendor: 'Elite Productions', customer: 'Lê Văn C', package: 'Gói Cao Cấp', amount: 30000000, date: '18/10/2024', status: 'completed' },
  { id: 'TRX-004', vendor: 'Future Stage', customer: 'Phạm Thị D', package: 'Gói Siêu Cấp', amount: 60000000, date: '17/10/2024', status: 'failed' },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Đang xử lý</span>;
    case 'completed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Thành công</span>;
    case 'failed':
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">Thất bại</span>;
    default:
      return null;
  }
};

export default function TransactionMonitor() {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Giám Sát Giao Dịch</h2>
        <button className="px-4 py-2 glass-card text-white font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Xuất Excel
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Giao Dịch Hôm Nay" 
          value={120000000} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+12%" 
          suffix="đ" 
        />
        <StatCard 
          title="Tổng Tháng Này" 
          value={3500000000} 
          icon={Activity} 
          trend="up" 
          trendValue="+5%" 
          suffix="đ" 
        />
        <StatCard 
          title="Đang Xử Lý" 
          value={5} 
          icon={Clock} 
          trend="neutral" 
          trendValue="Cần đối soát" 
        />
      </div>

      {/* Filters & Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none">
                <option value="all" className="bg-background-dark">Tất cả trạng thái</option>
                <option value="completed" className="bg-background-dark">Thành công</option>
                <option value="pending" className="bg-background-dark">Đang xử lý</option>
              </select>
            </div>
            <div className="relative flex-1 md:w-48">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Mã GD</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Gói dịch vụ</th>
                <th className="p-4 font-medium">Số tiền cọc</th>
                <th className="p-4 font-medium">Ngày GD</th>
                <th className="p-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{trx.id}</td>
                  <td className="p-4 text-sm text-slate-300">{trx.vendor}</td>
                  <td className="p-4 text-sm text-slate-300">{trx.customer}</td>
                  <td className="p-4 text-sm text-slate-300">{trx.package}</td>
                  <td className="p-4 text-sm font-bold text-primary">{formatVND(trx.amount)}</td>
                  <td className="p-4 text-sm text-slate-300">{trx.date}</td>
                  <td className="p-4"><StatusBadge status={trx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
          <span>Hiển thị 1-4 trên 156 giao dịch</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">Trước</button>
            <button className="px-3 py-1 rounded bg-primary text-background-dark font-medium">1</button>
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">2</button>
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">3</button>
            <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
