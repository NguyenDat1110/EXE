import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Loader, Wallet, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { createSubscriptionPayment } from '../../services/paymentApi';

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

export function SubscriptionCheckout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const plan = (location.state?.plan as 'basic' | 'vip') || 'basic';

  const [plans, setPlans] = useState<SubscriptionPlans | null>(null);
  const [vendor, setVendor] = useState<any | null>(undefined);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/subscription/plans');
        setPlans(response.data.plans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Không thể tải thông tin gói dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    // fetch vendor info to ensure approval
    (async () => {
      try {
        const res = await api.get('/vendor/info');
        setVendor(res.data.vendor);
      } catch (err: any) {
        if (err.response?.status === 404) setVendor(null);
        else setVendor(null);
      }
    })();
  }, []);

  const currentPlan = plans?.[plan];

  const handlePayOSCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Prevent purchasing same active plan on client as well
      if (vendor && vendor.subscriptionStatus === 'active' && vendor.subscriptionPlan === plan && vendor.subscriptionExpiry && new Date(vendor.subscriptionExpiry) > new Date()) {
        setError('Bạn đã có gói này đang hoạt động. Không thể mua lại trước khi hết hạn.');
        setIsProcessing(false);
        return;
      }

      // Gói miễn phí: kích hoạt trực tiếp, không cần thanh toán
      if (currentPlan?.price === 0) {
        const response = await api.post('/subscription/update', { plan });
        if (response.data) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/vendor/dashboard');
          }, 2000);
        }
        return;
      }

      // Gói trả phí: tạo link thanh toán PayOS rồi chuyển hướng
      const response = await createSubscriptionPayment(plan);
      if (response.data?.activated) {
        setSuccess(true);
        setTimeout(() => navigate('/vendor/dashboard'), 2000);
        return;
      }
      const checkoutUrl = response.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Không thể tạo link thanh toán');
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || err?.message || 'Lỗi khi tạo thanh toán');
      setIsProcessing(false);
    }
  };

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
            <button
              onClick={() => navigate('/vendor/registration/form')}
              className="mt-6 px-6 py-2 bg-cyan text-navy rounded-lg hover:bg-cyan/80 transition-colors"
            >
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
            <button
              onClick={() => navigate('/vendor/registration')}
              className="mt-6 px-6 py-2 bg-yellow-500/20 text-yellow-300 font-semibold rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
            >
              Xem Trạng Thái Hồ Sơ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-cyan/30 border-t-cyan animate-spin mx-auto mb-4"></div>
          <p className="text-silver/60">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-8 rounded-2xl text-center max-w-md"
        >
          <Check className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Đăng Ký Thành Công!</h2>
          <p className="text-silver/60 mb-6">
            Bạn đã nâng cấp lên gói {plan === 'vip' ? 'VIP' : 'Thường'}. Hãy bắt đầu kinh doanh!
          </p>
          <p className="text-silver/40 text-sm">Đang chuyển đến Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="font-display text-4xl text-white mb-2">Thanh Toán Gói Dịch Vụ</h1>
            <p className="text-silver/60">Hoàn tất thanh toán để kích hoạt gó {plan === 'vip' ? 'VIP' : 'Thường'}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-white font-semibold mb-4">Tóm Tắt Đơn Hàng</h3>

                <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                  <div className="flex justify-between text-silver/70">
                    <span>Gói dịch vụ:</span>
                    <span className="text-white font-medium">{currentPlan?.name}</span>
                  </div>
                  {currentPlan?.price === 0 ? (
                    <div className="flex justify-between text-silver/70">
                      <span>Giá:</span>
                      <span className="text-emerald-400 font-medium">Miễn phí</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-silver/70">
                        <span>Giá gói:</span>
                        <span className="text-white font-medium">
                          {currentPlan?.price.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-silver/70">
                        <span>Thuế (0%):</span>
                        <span>0₫</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Tổng:</span>
                  <span className={`text-2xl font-bold ${
                    currentPlan?.price === 0 ? 'text-emerald-400' : 'text-cyan'
                  }`}>
                    {currentPlan?.price === 0 ? 'Miễn phí' : `${currentPlan?.price.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-cyan/10 rounded-lg border border-cyan/30">
                  <p className="text-cyan text-sm">
                    ✓ Thời hạn: {currentPlan?.duration} ngày
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="glass-panel p-8 rounded-2xl space-y-6">
                <h3 className="text-white font-semibold text-lg">Phương Thức Thanh Toán</h3>

                {/* PayOS */}
                <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-cyan/40 bg-cyan/5">
                  <Wallet className="w-6 h-6 text-cyan mt-0.5" />
                  <div className="flex-grow">
                    <p className="text-white font-semibold">Thanh Toán Qua PayOS</p>
                    <p className="text-silver/60 text-sm mt-1">Quét mã QR hoặc chuyển khoản qua cổng thanh toán PayOS. Gói sẽ được kích hoạt tự động ngay khi thanh toán thành công.</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-silver/70 space-y-2">
                      <p>Bạn sẽ được chuyển đến trang thanh toán an toàn của PayOS.</p>
                      <p>Hỗ trợ quét QR bằng mọi ứng dụng ngân hàng (VietQR). Không cần gửi biên lai hay chờ xác thực thủ công.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handlePayOSCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-cyan to-cyan/70 text-navy font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : currentPlan?.price === 0 ? (
                    <>
                      <Check className="w-5 h-5" />
                      Kích Hoạt Gói Miễn Phí
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Thanh Toán Qua PayOS
                    </>
                  )}
                </button>

                <p className="text-silver/60 text-xs text-center">
                  {currentPlan?.price === 0
                    ? 'Gói miễn phí được kích hoạt ngay lập tức'
                    : 'Sau khi thanh toán thành công, bạn sẽ được đưa về trang kết quả'}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
