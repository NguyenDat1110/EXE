import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

interface Plan {
  name: string;
  price: number;
  duration: number;
  features: string[];
}

interface SubscriptionPlans {
  basic: Plan;
  vip: Plan;
}

export function SubscriptionPlans() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'vip' | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/subscription/plans');
        setPlans(response.data.plans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Không thể tải gói dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
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

  const handleSelectPlan = (plan: 'basic' | 'vip') => {
    setSelectedPlan(plan);
    // Redirect to checkout
    setTimeout(() => {
      navigate('/vendor/subscription-checkout', { state: { plan } });
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

  if (error || !plans) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">{error || 'Có lỗi xảy ra'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">
              Chọn Gói Dịch Vụ Của Bạn
            </h1>
            <p className="text-silver/60 text-lg max-w-2xl mx-auto">
              Nâng cấp gian hàng của bạn và mở khóa các tính năng tuyệt vời để thu hút thêm khách hàng
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-2xl border border-cyan/30 hover:border-cyan/60 transition-all duration-300 group"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-cyan" />
                  <h3 className="text-2xl font-bold text-white">{plans.basic.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-cyan">Miễn phí</span>
                </div>
                <p className="text-silver/60 text-sm mt-2">Thời hạn: {plans.basic.duration} ngày</p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-white font-semibold text-sm">Tính năng bao gồm:</p>
                {plans.basic.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-cyan flex-shrink-0" />
                    <span className="text-silver/70">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectPlan('basic')}
                disabled={selectedPlan === 'basic'}
                className="w-full py-3 rounded-lg font-semibold transition-all bg-cyan/10 text-cyan border border-cyan/50 hover:bg-cyan/20 disabled:opacity-50"
              >
                {selectedPlan === 'basic' ? 'Đang chuyển hướng...' : 'Chọn Gói Này'}
              </button>
            </motion.div>

            {/* VIP Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-2xl border-2 border-yellow-400/50 bg-yellow-500/5 hover:border-yellow-400/80 transition-all duration-300 relative group lg:scale-105"
            >
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-navy px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                <Star className="w-4 h-4" />
                Phổ Biến
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-2xl font-bold text-white">{plans.vip.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-yellow-400">
                    {plans.vip.price.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-silver/60">/năm</span>
                </div>
                <p className="text-silver/60 text-sm mt-2">Thời hạn: {plans.vip.duration} ngày</p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-white font-semibold text-sm">Tính năng bao gồm:</p>
                {plans.vip.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-silver/70">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectPlan('vip')}
                disabled={selectedPlan === 'vip'}
                className="w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 text-yellow-400 border border-yellow-400/50 hover:border-yellow-400/80 hover:from-yellow-400/30 hover:to-yellow-500/30 disabled:opacity-50"
              >
                {selectedPlan === 'vip' ? 'Đang chuyển hướng...' : 'Chọn VIP'}
              </button>
            </motion.div>
          </div>

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center text-silver/60"
          >
            <p className="text-sm">
              Bạn có thể nâng cấp hoặc thay đổi gói dịch vụ bất cứ lúc nào từ cài đặt tài khoản
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
