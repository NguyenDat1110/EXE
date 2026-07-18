import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, AlertCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

interface Plan {
  _id: string;
  name: string;
  code: string;
  type: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}

const typeMeta: Record<string, { icon: any; color: string; border: string; bg: string; badge: string }> = {
  basic: { icon: Zap, color: 'text-cyan', border: 'border-cyan/30', bg: 'bg-cyan/5', badge: '' },
  vip: { icon: Star, color: 'text-yellow-400', border: 'border-yellow-400/50', bg: 'bg-yellow-500/5', badge: 'Phổ Biến' },
};

export function SubscriptionPlans() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vendor, setVendor] = useState<any | null>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [plansRes, vendorRes] = await Promise.all([
          api.get('/subscription/plans'),
          api.get('/vendor/info').catch((err: any) => {
            if (err.response?.status === 404) return { data: { vendor: null } };
            throw err;
          }),
        ]);
        const plansObj = plansRes.data.plans || {};
        setPlans(Object.values(plansObj));
        setVendor(vendorRes.data.vendor ?? null);
      } catch {
        setError('Không thể tải gói dịch vụ');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">Chỉ vendor được phê duyệt mới có thể truy cập trang này</p>
          </div>
        </div>
      </div>
    );
  }

  if (vendor === null) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-white text-lg">Bạn chưa tạo hồ sơ doanh nghiệp. Vui lòng tạo hồ sơ trước khi mua gói.</p>
            <button onClick={() => navigate('/vendor/registration/form')}
              className="mt-6 px-6 py-2 bg-cyan text-navy rounded-lg hover:bg-cyan/80 transition-colors">
              Tạo Hồ Sơ Doanh Nghiệp
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (vendor && vendor.verificationStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center border-l-4 border-l-yellow-400 bg-yellow-500/5">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Hồ Sơ Đang Chờ Duyệt</h2>
            <p className="text-yellow-300 text-sm">Hồ sơ doanh nghiệp của bạn chưa được phê duyệt. Không thể mua gói lúc này.</p>
            <button onClick={() => navigate('/vendor/registration')}
              className="mt-6 px-6 py-2 bg-yellow-500/20 text-yellow-300 font-semibold rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors">
              Xem Trạng Thái Hồ Sơ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan.code);
    setTimeout(() => {
      navigate('/vendor/subscription-checkout', { state: { plan: plan.code } });
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-cyan/30 border-t-cyan animate-spin mx-auto mb-4"></div>
          <p className="text-silver/60">Đang tải gói dịch vụ...</p>
        </div>
      </div>
    );
  }

  if (error || plans.length === 0) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">{error || 'Hiện chưa có gói dịch vụ nào'}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPlanCode = vendor?.subscriptionPlan || null;
  const expiry = vendor?.subscriptionExpiry ? new Date(vendor.subscriptionExpiry) : null;
  const activePlan = plans.find(p => p.code === currentPlanCode) || plans.find(p => p.type === currentPlanCode) || null;
  const purchased = (vendor?.purchasedSubscriptions || []) as Array<{ planCode: string; expiryAt: string }>;

  const handleReactivate = async (planCode: string) => {
    try {
      setSelectedPlan(planCode);
      await api.post('/subscription/reactivate', { plan: planCode });
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi kích hoạt lại');
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <div className="text-center">
            <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">Chọn Gói Dịch Vụ Của Bạn</h1>
            <p className="text-silver/60 text-lg max-w-2xl mx-auto">
              Nâng cấp gian hàng của bạn và mở khóa các tính năng tuyệt vời để thu hút thêm khách hàng
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
            {plans.map((plan, idx) => {
              const type = plan.type;
              const meta = typeMeta[type] || typeMeta.basic;
              const Icon = meta.icon;
              const isOwner = activePlan?._id === plan._id;
              const isActiveSub = isOwner && expiry && expiry > new Date();
              const purchasedSub = purchased.find(s => s.planCode === plan.code);
              const canReactivate = purchasedSub && !isActiveSub && new Date(purchasedSub.expiryAt) > new Date();
              const showAsInactive = !plan.isActive && !isActiveSub && !canReactivate;

              return (
                <motion.div key={plan._id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`glass-panel p-8 rounded-2xl border-2 ${meta.border} ${meta.bg} hover:scale-[1.02] transition-all duration-300 relative ${showAsInactive ? 'opacity-50 grayscale' : ''}`}>
                  {meta.badge && plan.isActive && !showAsInactive && (
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-navy px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 z-10">
                      <Crown className="w-4 h-4" />
                      {meta.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mt-2">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-bold text-emerald-400">Miễn phí</span>
                      ) : (
                        <>
                          <span className={`text-4xl font-bold ${meta.color}`}>
                            {plan.price.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-silver/60">/{plan.duration} ngày</span>
                        </>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <p className="text-silver/60 text-sm mt-2">Thời hạn: {plan.duration} ngày</p>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-white font-semibold text-sm">Tính năng bao gồm:</p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${meta.color} flex-shrink-0`} />
                        <span className="text-silver/70">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {showAsInactive ? (
                    <button disabled
                      className="w-full py-3 rounded-lg font-semibold bg-white/5 text-slate-500 cursor-not-allowed">
                      Tạm ngưng
                    </button>
                  ) : isActiveSub ? (
                    <button disabled
                      className="w-full py-3 rounded-lg font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Đang hoạt động (hết hạn {expiry!.toLocaleDateString()})
                    </button>
                  ) : canReactivate ? (
                    <button onClick={() => handleReactivate(plan.code)}
                      disabled={selectedPlan === plan.code}
                      className="w-full py-3 rounded-lg font-semibold transition-all bg-amber-500/10 text-amber-400 border border-amber-500/50 hover:bg-amber-500/20 disabled:opacity-50">
                      {selectedPlan === plan.code ? 'Đang kích hoạt...' : 'Kích Hoạt Lại'}
                    </button>
                  ) : (
                    <button onClick={() => handleSelectPlan(plan)}
                      disabled={selectedPlan === plan.code}
                       className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        type === 'vip'
                          ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 text-yellow-400 border border-yellow-400/50 hover:from-yellow-400/30 hover:to-yellow-500/30'
                          : 'bg-cyan/10 text-cyan border border-cyan/50 hover:bg-cyan/20'
                      } disabled:opacity-50`}>
                      {selectedPlan === plan.code ? 'Đang chuyển hướng...' : plan.price === 0 ? 'Chọn Gói Miễn Phí' : 'Chọn Gói Này'}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-center text-silver/60">
            <p className="text-sm">
              Bạn có thể nâng cấp hoặc thay đổi gói dịch vụ bất cứ lúc nào từ cài đặt tài khoản
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
