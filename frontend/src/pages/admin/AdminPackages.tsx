import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { getAllPackages, togglePackageStatus } from '../../services/adminApi';

interface PackageData {
  _id: string;
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  guestMin: number;
  guestMax: number;
  isActive: boolean;
  createdAt: string;
  vendorId: string;
  vendorName: string;
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getAllPackages();
      setPackages(res.data || []);
    } catch (err) {
      console.error('Failed to load packages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (vendorId: string, packageId: string, currentStatus: boolean) => {
    try {
      await togglePackageStatus(vendorId, packageId, !currentStatus);
      // Update local state
      setPackages(packages.map(p => p._id === packageId ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      console.error('Failed to toggle package status', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Quản Lý Nội Dung Package</h1>
          <p className="text-silver/60 mt-1">Duyệt và quản lý các package được tạo bởi vendor.</p>
        </div>
        <div className="bg-cyan/10 border border-cyan/30 px-4 py-2 rounded-full flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan">Admin Mode</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm package hoặc vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-200">Lọc</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-4 font-medium">Tên Package</th>
                  <th className="py-4 font-medium">Vendor</th>
                  <th className="py-4 font-medium">Giá (VND)</th>
                  <th className="py-4 font-medium">Sức chứa (khách)</th>
                  <th className="py-4 font-medium text-center">Trạng thái</th>
                  <th className="py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{pkg.name}</div>
                      <div className="text-xs text-slate-400 max-w-xs truncate">{pkg.description}</div>
                    </td>
                    <td className="py-4 text-cyan text-sm">{pkg.vendorName}</td>
                    <td className="py-4 text-sm text-slate-300">
                      {pkg.priceMin.toLocaleString()} - {pkg.priceMax.toLocaleString()}
                    </td>
                    <td className="py-4 text-sm text-slate-300">
                      {pkg.guestMin} - {pkg.guestMax}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        pkg.isActive 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {pkg.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(pkg.vendorId, pkg._id, pkg.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          pkg.isActive 
                            ? 'text-red-400 hover:bg-red-500/10' 
                            : 'text-green-400 hover:bg-green-500/10'
                        }`}
                        title={pkg.isActive ? "Ẩn package" : "Hiện package"}
                      >
                        {pkg.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPackages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Không tìm thấy package nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
