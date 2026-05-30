import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle, XCircle, Plus, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface VendorStatus {
  verificationStatus: 'pending' | 'approved' | 'rejected';
  companyName?: string;
  taxId?: string;
  verificationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function VendorSubmissionStatus() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVendorStatus = async () => {
      if (!user || user.role !== 'vendor') {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/vendor/info');
        if (response.data?.vendor) {
          const vendor = response.data.vendor;
          setVendorStatus({
            verificationStatus: vendor.verificationStatus,
            companyName: vendor.companyName,
            taxId: vendor.taxId,
            verificationReason: vendor.verificationReason,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt
          });
        } else {
          // No vendor record yet
          setVendorStatus(null);
        }
      } catch (err: any) {
        // 404 is expected for new vendors
        if (err.response?.status !== 404) {
          console.error('Error loading vendor status:', err);
          setError('Lỗi tải thông tin. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadVendorStatus();
  }, [user]);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">Chỉ vendor mới có thể truy cập trang này</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-cyan text-navy rounded-lg hover:bg-cyan/80 transition-colors"
            >
              Quay lại
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
          <p className="text-silver/60">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="font-display text-4xl text-white mb-2">Hồ Sơ Doanh Nghiệp</h1>
            <p className="text-silver/60">Quản lý và theo dõi trạng thái hồ sơ doanh nghiệp của bạn</p>
          </div>

          {/* No Submission - Show Create Button */}
          {!vendorStatus && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-2xl text-center border border-cyan/30"
            >
              <Plus className="w-16 h-16 text-cyan mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Chưa Có Hồ Sơ Doanh Nghiệp</h2>
              <p className="text-silver/70 mb-6">
                Tạo hồ sơ doanh nghiệp của bạn để có thể bắt đầu cung cấp dịch vụ
              </p>
              <button
                onClick={() => navigate('/vendor/registration/form')}
                className="px-8 py-3 bg-gradient-to-r from-cyan to-cyan/70 text-navy font-bold rounded-lg hover:shadow-lg hover:shadow-cyan/30 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Tạo Hồ Sơ Doanh Nghiệp
              </button>
            </motion.div>
          )}

          {/* Pending Status */}
          {vendorStatus?.verificationStatus === 'pending' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-2xl border-l-4 border-l-yellow-400 bg-yellow-500/5"
            >
              <div className="flex items-center gap-4 mb-6">
                <Clock className="w-12 h-12 text-yellow-400 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Đơn Đang Xét Duyệt</h2>
                  <p className="text-yellow-300 text-sm">Hồ sơ đang được xem xét bởi admin</p>
                </div>
              </div>

              {vendorStatus.companyName && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-silver/60 text-sm">Tên Công Ty</p>
                      <p className="text-white font-semibold">{vendorStatus.companyName}</p>
                    </div>
                    {vendorStatus.taxId && (
                      <div>
                        <p className="text-silver/60 text-sm">Mã Số Thuế</p>
                        <p className="text-white font-semibold">{vendorStatus.taxId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-yellow-200 text-sm mb-6">
                ⏳ Chúng tôi sẽ xem xét hồ sơ của bạn trong 2-3 ngày làm việc. Bạn có thể cập nhật thông tin nếu cần thiết.
              </p>

              <button
                onClick={() => navigate('/vendor/registration/form')}
                className="w-full px-6 py-3 bg-yellow-500/20 text-yellow-300 font-semibold rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors inline-flex items-center justify-center gap-2"
              >
                ✏️ Cập Nhật Thông Tin Xét Duyệt
              </button>
            </motion.div>
          )}

          {/* Approved Status */}
          {vendorStatus?.verificationStatus === 'approved' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-400 bg-emerald-500/5"
            >
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Đã Được Phê Duyệt ✅</h2>
                  <p className="text-emerald-300 text-sm">Hồ sơ doanh nghiệp của bạn đã được phê duyệt thành công</p>
                </div>
              </div>

              {vendorStatus.companyName && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-silver/60 text-sm">Tên Công Ty</p>
                      <p className="text-white font-semibold">{vendorStatus.companyName}</p>
                    </div>
                    {vendorStatus.taxId && (
                      <div>
                        <p className="text-silver/60 text-sm">Mã Số Thuế</p>
                        <p className="text-white font-semibold">{vendorStatus.taxId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-emerald-200 text-sm mb-6">
                🎉 Xin chúc mừng! Bạn giờ đã có thể bắt đầu cung cấp dịch vụ. Bạn có thể cập nhật thông tin bất cứ lúc nào.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/vendor/dashboard')}
                  className="flex-1 px-6 py-3 bg-emerald-500/20 text-emerald-300 font-semibold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                >
                  Vào Dashboard
                </button>
                <button
                  onClick={() => navigate('/vendor/registration/form')}
                  className="flex-1 px-6 py-3 bg-cyan/20 text-cyan font-semibold rounded-lg border border-cyan/30 hover:bg-cyan/30 transition-colors"
                >
                  Cập Nhật Thông Tin
                </button>
              </div>
            </motion.div>
          )}

          {/* Rejected Status */}
          {vendorStatus?.verificationStatus === 'rejected' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-2xl border-l-4 border-l-red-400 bg-red-500/5"
            >
              <div className="flex items-center gap-4 mb-6">
                <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Đơn Bị Từ Chối</h2>
                  <p className="text-red-300 text-sm">Hồ sơ của bạn chưa được chấp nhận</p>
                </div>
              </div>

              {vendorStatus.companyName && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-silver/60 text-sm">Tên Công Ty</p>
                      <p className="text-white font-semibold">{vendorStatus.companyName}</p>
                    </div>
                    {vendorStatus.taxId && (
                      <div>
                        <p className="text-silver/60 text-sm">Mã Số Thuế</p>
                        <p className="text-white font-semibold">{vendorStatus.taxId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {vendorStatus.verificationReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-sm font-semibold mb-1">Lý Do Từ Chối:</p>
                  <p className="text-red-200 text-sm">{vendorStatus.verificationReason}</p>
                </div>
              )}

              <p className="text-red-200 text-sm mb-6">
                ❌ Vui lòng cập nhật thông tin theo lý do từ chối và gửi lại hồ sơ.
              </p>

              <button
                onClick={() => navigate('/vendor/registration/form')}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan to-cyan/70 text-navy font-bold rounded-lg hover:shadow-lg hover:shadow-cyan/30 transition-all inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Nộp Lại Hồ Sơ
              </button>
            </motion.div>
          )}

          {error && (
            <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-500/5">
              <p className="text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
