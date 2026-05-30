import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface VendorInfo {
  _id: string;
  companyName: string;
  taxId: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationReason?: string;
  isVerified: boolean;
  createdAt: string;
}

export function VendorVerification() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorInfo = async () => {
      try {
        const response = await api.get('/vendor/info');
        setVendor(response.data.vendor);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'vendor') {
      fetchVendorInfo();
    }
  }, [user]);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">Chỉ vendor mới có thể truy cập trang này</p>
            <button
              onClick={() => navigate('/explore')}
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

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg text-center mb-6">{error || 'Không tìm thấy thông tin'}</p>
            <button
              onClick={() => navigate('/vendor/registration')}
              className="w-full px-6 py-2 bg-cyan text-navy rounded-lg hover:bg-cyan/80 transition-colors"
            >
              Cập nhật thông tin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (vendor.verificationStatus) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-400" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-400" />;
    }
  };

  const getStatusText = () => {
    switch (vendor.verificationStatus) {
      case 'approved':
        return {
          title: 'Phê Duyệt Thành Công! 🎉',
          message: `Xin chúc mừng! Hồ sơ của ${vendor.companyName} đã được phê duyệt. Bạn giờ đã có thể bắt đầu cung cấp dịch vụ.`,
          color: 'emerald'
        };
      case 'rejected':
        return {
          title: 'Hồ Sơ Bị Từ Chối',
          message: vendor.verificationReason || 'Hồ sơ của bạn không được phê duyệt. Vui lòng cập nhật thông tin và gửi lại.',
          color: 'red'
        };
      default:
        return {
          title: 'Đang Chờ Duyệt',
          message: 'Hồ sơ của bạn đang được xem xét. Chúng tôi sẽ gửi email thông báo trong 2-3 ngày làm việc.',
          color: 'yellow'
        };
    }
  };

  const status = getStatusText();

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-4xl text-white mb-2">Trạng Thái Duyệt</h1>
            <p className="text-silver/60">Kiểm tra tình trạng phê duyệt hồ sơ doanh nghiệp của bạn</p>
          </div>

          {/* Status Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`glass-panel p-8 rounded-2xl text-center border border-${status.color}-500/30 bg-${status.color}-500/5`}
          >
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>

            <h2 className="font-display text-3xl text-white mb-4">{status.title}</h2>
            <p className="text-silver/70 text-lg mb-8">{status.message}</p>

            {/* Company Info */}
            <div className="bg-white/5 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-white font-semibold mb-4">Thông Tin Doanh Nghiệp</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-silver/60 text-sm">Tên Công Ty</p>
                  <p className="text-white font-medium">{vendor.companyName}</p>
                </div>
                <div>
                  <p className="text-silver/60 text-sm">Mã Số Thuế</p>
                  <p className="text-white font-medium">{vendor.taxId}</p>
                </div>
                <div>
                  <p className="text-silver/60 text-sm">Ngày Đăng Ký</p>
                  <p className="text-white font-medium">
                    {new Date(vendor.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {vendor.verificationStatus === 'rejected' && vendor.verificationReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
                <p className="text-red-400 text-sm font-semibold mb-2">Lý Do Từ Chối</p>
                <p className="text-red-300">{vendor.verificationReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate('/vendor/registration')}
                className="px-6 py-2 rounded-lg bg-cyan text-navy font-semibold hover:bg-cyan/80 transition-colors"
              >
                {vendor.verificationStatus === 'pending' 
                  ? 'Cập Nhật Thông Tin Xét Duyệt'
                  : vendor.verificationStatus === 'rejected'
                  ? 'Gửi Lại'
                  : 'Cập Nhật Thông Tin'
                }
              </button>

              {vendor.verificationStatus === 'approved' && (
                <button
                  onClick={() => navigate('/vendor/dashboard')}
                  className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Vào Dashboard
                </button>
              )}

              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                Quay Lại
              </button>
            </div>
          </motion.div>

          {/* Info Box */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan/30">
            <p className="text-silver/60">
              💡 <span className="text-white font-semibold">Mẹo:</span> Hãy chắc chắn rằng tất cả thông tin doanh nghiệp của bạn đầy đủ và chính xác. 
              Điều này sẽ giúp quy trình duyệt diễn ra nhanh hơn.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
