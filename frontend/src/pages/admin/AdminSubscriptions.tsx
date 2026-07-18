import React, { useState, useEffect } from 'react';
import { Crown, Edit2, Plus, Search, CheckCircle, Trash2, ToggleLeft, ToggleRight, X, Star, Zap, CheckCircle as CheckCircleIcon, AlertCircle, Info } from 'lucide-react';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, getAllUsers, updateVendorSubscription } from '../../services/adminApi';

type ToastType = 'success' | 'error' | 'info';

interface ToastMsg {
  id: number;
  message: string;
  type: ToastType;
}

interface PlanForm {
  name: string;
  code: string;
  type: string;
  price: string;
  durationMonths: string;
  features: string[];
}

const emptyForm: PlanForm = { name: '', code: '', type: 'vip', price: '', durationMonths: '1', features: [''] };

const typeBadge: Record<string, { icon: any; label: string; border: string; bg: string; color: string }> = {
  basic: { icon: Zap, label: 'Basic', border: 'border-cyan/40', bg: 'bg-cyan/5', color: 'text-cyan' },
  vip: { icon: Star, label: 'VIP', border: 'border-yellow-400/50', bg: 'bg-yellow-500/5', color: 'text-yellow-400' },
};

const typeOptions = [
  { value: 'basic', label: 'Basic', icon: Zap, color: 'text-cyan' },
  { value: 'vip', label: 'VIP', icon: Star, color: 'text-yellow-400' },
];

export default function AdminSubscriptions() {
  const [activeTab, setActiveTab] = useState<'plans' | 'grant'>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PlanForm, string>>>({});
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const showConfirm = (msg: string, onOk: () => void) => {
    setConfirmMsg(msg);
    setConfirmAction(() => onOk);
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  useEffect(() => {
    if (activeTab === 'plans') fetchPlans();
    else fetchVendors();
  }, [activeTab]);

  const fetchPlans = async () => {
    try { setLoading(true); const res = await getSubscriptionPlans(); setPlans(res.data || []); }
    catch { console.error('Failed to load plans'); }
    finally { setLoading(false); }
  };

  const fetchVendors = async () => {
    try { setLoading(true); const res = await getAllUsers(searchTerm, 'vendor', 1, 50); setVendors(res.data || []); }
    catch { console.error('Failed to load vendors'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingPlan(null); setForm(emptyForm); setFormErrors({}); setShowModal(true); setShowTypePicker(false); };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormErrors({});
    setForm({
      name: plan.name,
      code: plan.code || '',
      type: plan.type,
      price: String(plan.price),
      durationMonths: String(plan.durationMonths),
      features: plan.features?.length ? [...plan.features] : [''],
    });
    setShowModal(true);
    setShowTypePicker(false);
  };

  const setFeatureAt = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setForm((prev) => {
      const next = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: next.length ? next : [''] };
    });
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof PlanForm, string>> = {};
    if (!form.name.trim()) errors.name = 'Vui lòng nhập tên gói';
    if (!form.code.trim()) errors.code = 'Vui lòng nhập mã gói';
    if (!form.price || Number(form.price) < 0) errors.price = 'Vui lòng nhập giá hợp lệ';
    if (!form.durationMonths || !Number.isInteger(Number(form.durationMonths)) || Number(form.durationMonths) < 1) errors.durationMonths = 'Vui lòng nhập số tháng hợp lệ (số nguyên dương)';
    if (!form.features.some((f) => f.trim())) errors.features = 'Vui lòng nhập ít nhất một tính năng';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const cleaned = form.features.map((f) => f.trim()).filter(Boolean);
    const payload = {
      name: form.name.trim(),
      code: form.code.toUpperCase(),
      type: form.type,
      price: Number(form.price),
      durationMonths: Number(form.durationMonths),
      features: cleaned,
    };
    try {
      if (editingPlan) await updateSubscriptionPlan(editingPlan._id, payload);
      else await createSubscriptionPlan(payload);
      setShowModal(false);
      fetchPlans();
    } catch { showToast('Lỗi lưu gói', 'error'); }
  };

  const handleDelete = async (planId: string, name: string) => {
    showConfirm(`Xoá gói "${name}"?`, async () => {
      try { await deleteSubscriptionPlan(planId); fetchPlans(); showToast('Xoá gói thành công', 'success'); }
      catch (err: any) { showToast(err?.response?.data?.message || 'Lỗi xoá gói', 'error'); }
    });
  };

  const handleToggleActive = async (plan: any) => {
    try { await updateSubscriptionPlan(plan._id, { isActive: !plan.isActive }); fetchPlans(); showToast(plan.isActive ? 'Đã tắt gói' : 'Đã bật gói', 'success'); }
    catch { showToast('Lỗi cập nhật trạng thái', 'error'); }
  };

  const handleUpdateVendorVIP = async (vendorId: string, action: 'extend' | 'revoke') => {
    const msg = action === 'extend' ? 'Gia hạn thêm 30 ngày VIP cho vendor này?' : 'Thu hồi gói VIP của vendor này?';
    showConfirm(msg, async () => {
      try {
        await updateVendorSubscription(vendorId, { action, days: 30, planType: 'vip' });
        showToast('Thao tác thành công', 'success');
        fetchVendors();
      } catch { showToast('Lỗi khi cập nhật VIP vendor', 'error'); }
    });
  };

  const selectedTypeMeta = typeOptions.find((t) => t.value === form.type);
  const TypeIcon = selectedTypeMeta?.icon || Star;

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
        {(['plans', 'grant'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-cyan/20 text-cyan shadow-sm shadow-cyan/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab === 'plans' ? 'Cấu hình gói' : 'Cấp phát VIP'}
          </button>
        ))}
      </div>

      {/* ========== TAB: Cấu hình gói ========== */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan to-cyan/70 text-navy font-bold rounded-xl hover:shadow-lg hover:shadow-cyan/20 transition-all">
              <Plus className="w-5 h-5" /> Tạo Gói Mới
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400 text-center py-12">Đang tải...</p>
          ) : plans.length === 0 ? (
            <p className="text-slate-400 text-center py-12">Chưa có gói nào.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const badge = typeBadge[plan.type] || typeBadge.basic;
                const BadgeIcon = badge.icon;
                return (
                  <div key={plan._id}
                    className={`relative rounded-2xl border-2 ${badge.border} ${badge.bg} p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                      plan.type === 'vip' ? 'hover:shadow-yellow-400/10' : 'hover:shadow-cyan/10'
                    }`}>
                    {/* Action buttons — always visible, 2x size */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => openEdit(plan)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-cyan/20 text-slate-300 hover:text-cyan transition-all shadow-sm" title="Sửa">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(plan._id, plan.name)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all shadow-sm" title="Xoá">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleToggleActive(plan)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shadow-sm ${
                          plan.isActive
                            ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                            : 'bg-white/10 text-slate-500 hover:bg-white/20'
                        }`} title={plan.isActive ? 'Tắt' : 'Bật'}>
                        <span className={`w-8 h-4 rounded-full transition-colors ${
                          plan.isActive ? 'bg-green-400' : 'bg-slate-500'
                        } relative`}>
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${
                            plan.isActive ? 'left-[18px]' : 'left-0.5'
                          }`} />
                        </span>
                        <span className="text-xs font-medium">{plan.isActive ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    {/* Type badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.color} bg-white/10 mb-4`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.label}
                    </div>

                    {/* Name + Code */}
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mb-4">{plan.code}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-6">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-bold text-emerald-400">Miễn phí</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-white">{plan.price.toLocaleString()}</span>
                          <span className="text-xl text-slate-400">đ</span>
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Tính năng</p>
                      {plan.features?.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle className={`w-4 h-4 shrink-0 ${badge.color}`} />
                          <span className="text-sm text-slate-300">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Purchase stats */}
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <span>Đã mua: <strong className="text-white">{plan.totalPurchased ?? 0}</strong></span>
                      <span>Đang dùng: <strong className="text-emerald-400">{plan.activeCount ?? 0}</strong></span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        plan.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {plan.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {plan.durationMonths} tháng
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: Cấp phát VIP ========== */}
      {activeTab === 'grant' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm vendor..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchVendors()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan" />
            </div>
            <button onClick={fetchVendors}
              className="px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 text-white text-sm transition-colors">Tìm</button>
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
                {vendors.map((user) => {
                  const v = user.vendorInfo;
                  if (!v) return null;
                  return (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4">
                        <div className="font-medium text-white">{v.companyName || user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </td>
                      <td className="py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          v.verificationStatus === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>
                          {v.verificationStatus === 'approved' ? 'Đã duyệt' : v.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        {v.subscriptionStatus === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Đang hoạt động
                            {v.subscriptionExpiry && ` (đến ${new Date(v.subscriptionExpiry).toLocaleDateString('vi-VN')})`}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button onClick={() => handleUpdateVendorVIP(v._id, 'extend')}
                          className="px-3 py-1.5 bg-cyan/10 text-cyan hover:bg-cyan/20 rounded-lg text-sm font-medium transition-colors border border-cyan/30">
                          Cấp/Gia Hạn
                        </button>
                        <button onClick={() => handleUpdateVendorVIP(v._id, 'revoke')}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors border border-red-500/30">
                          Thu hồi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== CREATE/EDIT MODAL ========== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-panel p-8 rounded-2xl w-full max-w-xl mx-4 border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingPlan ? 'Sửa Gói' : 'Tạo Gói Mới'}</h2>
                <p className="text-sm text-slate-400 mt-1">{editingPlan ? 'Chỉnh sửa thông tin gói dịch vụ' : 'Thêm gói dịch vụ mới cho vendor'}</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormErrors({}); }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Tên gói + Code */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên gói</label>
                    <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors((prev) => ({ ...prev, name: '' })); }}
                      placeholder="VD: Gói VIP 3 Tháng"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan transition-colors" />
                    {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
                  </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Mã gói</label>
                  <input value={form.code} onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); setFormErrors((prev) => ({ ...prev, code: '' })); }}
                    placeholder="VD: VIP_3M"
                    disabled={!!editingPlan}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                  {formErrors.code && <p className="mt-1 text-xs text-red-400">{formErrors.code}</p>}
                </div>
              </div>

              {/* Loại (custom dropdown luôn hiển thị) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Loại</label>
                <div className="relative">
                  <button type="button" onClick={() => setShowTypePicker(!showTypePicker)}
                    className="w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan transition-colors text-left">
                    <TypeIcon className={`w-4 h-4 ${selectedTypeMeta?.color}`} />
                    {selectedTypeMeta?.label}
                    <span className="ml-auto text-slate-500">▼</span>
                  </button>
                  {showTypePicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-navy border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                      {typeOptions.map((opt) => {
                        const OptIcon = opt.icon;
                        return (
                          <button key={opt.value} type="button" onClick={() => { setForm({ ...form, type: opt.value }); setShowTypePicker(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors text-left hover:bg-white/5 ${
                              form.type === opt.value ? 'bg-white/10 text-white' : 'text-slate-300'
                            }`}>
                            <OptIcon className={`w-4 h-4 ${opt.color}`} />
                            {opt.label}
                            {form.type === opt.value && <CheckCircle className="w-4 h-4 text-cyan ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Giá — riêng 1 hàng */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Giá (VND)</label>
                <input type="number" value={form.price} onChange={(e) => { setForm({ ...form, price: e.target.value }); setFormErrors((prev) => ({ ...prev, price: '' })); }}
                  placeholder="0 = miễn phí"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan transition-colors" />
                <p className="text-xs text-slate-500 mt-1">Nhập 0 nếu gói miễn phí</p>
                {formErrors.price && <p className="mt-1 text-xs text-red-400">{formErrors.price}</p>}
              </div>

              {/* Thời hạn */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Thời hạn (tháng)</label>
                <input type="number" value={form.durationMonths} onChange={(e) => { setForm({ ...form, durationMonths: e.target.value }); setFormErrors((prev) => ({ ...prev, durationMonths: '' })); }}
                  placeholder="1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan transition-colors" />
                <p className="text-xs text-slate-500 mt-1">Số tháng gói có hiệu lực</p>
                {formErrors.durationMonths && <p className="mt-1 text-xs text-red-400">{formErrors.durationMonths}</p>}
              </div>

              {/* Tính năng */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Tính năng</span>
                  <button type="button" onClick={addFeature}
                    className="text-cyan hover:text-cyan/80 text-xs font-medium hover:underline transition-colors">
                    + Thêm tính năng
                  </button>
                </label>
                <div className="space-y-2">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={feat} onChange={(e) => setFeatureAt(idx, e.target.value)}
                        placeholder="VD: 3D Images, 360 Viewer..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan transition-colors" />
                      <button type="button" onClick={() => removeFeature(idx)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
                {formErrors.features && <p className="mt-1 text-xs text-red-400">{formErrors.features}</p>}
              </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => { setShowModal(false); setShowTypePicker(false); }}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                Huỷ
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan to-cyan/70 text-navy font-bold rounded-xl hover:shadow-lg hover:shadow-cyan/20 transition-all text-sm">
                {editingPlan ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmMsg && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-navy border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-white text-lg font-medium mb-6">{confirmMsg}</p>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmMsg(null); setConfirmAction(null); }}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                Huỷ
              </button>
              <button onClick={() => { const fn = confirmAction; setConfirmMsg(null); setConfirmAction(null); fn?.(); }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan to-cyan/70 text-navy font-bold rounded-xl hover:shadow-lg hover:shadow-cyan/20 transition-all text-sm">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md pointer-events-auto ${
              t.type === 'success' ? 'bg-cyan/10 border-cyan/30 text-cyan' :
              t.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-white/10 border-white/20 text-slate-200'
            }`}>
            {t.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {t.type === 'info' && <Info className="w-5 h-5" />}
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
