import React, { useState, useEffect } from 'react';
import { Crown, Edit2, Plus, Search, ShieldAlert, CheckCircle } from 'lucide-react';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, getAllUsers, updateVendorSubscription } from '../../services/adminApi';

export default function AdminSubscriptions() {
  const [activeTab, setActiveTab] = useState<'plans' | 'grant'>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'plans') {
      fetchPlans();
    } else {
      fetchVendors();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionPlans();
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Fetch users with role vendor
      const res = await getAllUsers(searchTerm, 'vendor', 1, 50);
      setVendors(res.data || []);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    const name = prompt('Tên gói (VD: VIP 1 Tháng):');
    if (!name) return;
    const priceStr = prompt('Giá tiền (VND):');
    if (!priceStr) return;
    const duration = prompt('Thời hạn (Tháng):', '1');
    
    try {
      await createSubscriptionPlan({
        name,
        type: 'vip',
        price: Number(priceStr),
        durationMonths: Number(duration),
        features: ['Ưu tiên hiển thị', 'Không giới hạn package']
      });
      fetchPlans();
    } catch (err) {
      alert('Lỗi tạo gói');
    }
  };

  const handleUpdateVendorVIP = async (vendorId: string, action: 'extend' | 'revoke') => {
    const confirmMsg = action === 'extend' ? 'Gia hạn thêm 30 ngày VIP cho vendor này?' : 'Thu hồi gói VIP của vendor này?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateVendorSubscription(vendorId, { action, days: 30, planType: 'vip' });
      alert('Thao tác thành công');
      fetchVendors();
    } catch (err) {
      alert('Lỗi khi cập nhật VIP vendor');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Quản Lý Subscription</h1>
          <p className="text-silver/60 mt-1">Cấu hình gói dịch vụ và cấp phát VIP thủ công.</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-full flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Admin Mode</span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'plans' ? 'bg-cyan/20 text-cyan' : 'text-slate-400 hover:text-white'}`}
        >
          Cấu hình gói
        </button>
        <button 
          onClick={() => setActiveTab('grant')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'grant' ? 'bg-cyan/20 text-cyan' : 'text-slate-400 hover:text-white'}`}
        >
          Cấp phát VIP
        </button>
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={handleCreatePlan} className="flex items-center gap-2 px-4 py-2 bg-cyan text-navy font-bold rounded-xl hover:bg-cyan-light transition-colors">
              <Plus className="w-5 h-5" />
              Tạo Gói Mới
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? <p className="text-slate-400">Đang tải...</p> : plans.map(plan => (
              <div key={plan._id} className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-white/10 hover:border-cyan/30 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <button className="text-slate-400 hover:text-cyan"><Edit2 className="w-5 h-5" /></button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-cyan mb-4">{plan.price.toLocaleString()}đ<span className="text-sm text-slate-400 font-normal"> / {plan.durationMonths} tháng</span></div>
                <ul className="space-y-2 mb-6">
                  {plan.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {plan.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grant' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm vendor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVendors()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan"
              />
            </div>
            <button onClick={fetchVendors} className="px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20">Tìm</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-4 font-medium">Vendor</th>
                  <th className="py-4 font-medium">Trạng thái xác thực</th>
                  <th className="py-4 font-medium">Trạng thái VIP</th>
                  <th className="py-4 font-medium text-right">Thao tác thủ công</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(user => {
                  const vendorInfo = user.vendorInfo;
                  if (!vendorInfo) return null;
                  
                  // For the sake of this UI, we assume vendorInfo is returned with subscription details, or we can just show the buttons.
                  // Since `getAllUsers` with vendor returns vendorInfo {companyName, verificationStatus}, it might not have subscription details yet.
                  // But we can still provide the manual action buttons.
                  return (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4">
                        <div className="font-medium text-white">{vendorInfo.companyName || user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </td>
                      <td className="py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${vendorInfo.verificationStatus === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {vendorInfo.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-slate-300">
                        {/* Status UI placeholder */}
                        -
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleUpdateVendorVIP(vendorInfo._id, 'extend')}
                          className="px-3 py-1.5 bg-cyan/10 text-cyan hover:bg-cyan/20 rounded-lg text-sm transition-colors border border-cyan/30"
                        >
                          Cấp/Gia Hạn VIP
                        </button>
                        <button 
                          onClick={() => handleUpdateVendorVIP(vendorInfo._id, 'revoke')}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/30"
                        >
                          Thu hồi
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
