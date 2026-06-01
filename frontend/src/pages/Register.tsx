import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      setSuccessMsg(response.data.message || 'Đăng ký thành công!');
      setIsLoading(false);
      
      setTimeout(() => {
        if (formData.role === 'vendor') {
          navigate('/vendor/registration');
        } else {
          navigate('/login');
        }
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-[180px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10"
      >
        {/* Bento Box Left - Info */}
        <div className="md:col-span-5 glass-panel rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-cyan">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
              </svg>
              <h2 className="text-xl font-bold tracking-widest font-manrope text-white">CLICKPICK</h2>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-serif italic text-white leading-tight">
                Gia nhập thế giới <span className="text-cyan">sự kiện đẳng cấp</span>
              </h1>
              <p className="text-silver/60 text-sm leading-relaxed">
                Tạo tài khoản để tìm kiếm các gói dịch vụ tổ chức tiệc cưới, hội thảo, sinh nhật cao cấp từ những vendor hàng đầu.
              </p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 mt-6">
            <p className="text-xs text-silver/40 uppercase tracking-wider">PREMIUM PLATFORM</p>
            <p className="text-xs text-silver/60 mt-1">© 2026 CLICKPICK VIETNAM.</p>
          </div>
        </div>

        {/* Bento Box Right - Form */}
        <div className="md:col-span-7 glass-panel backdrop-blur-md bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white font-manrope">Đăng Ký Tài Khoản</h2>
            <p className="text-silver/60 text-sm mt-1">Trải nghiệm dịch vụ đặt lịch sự kiện tối ưu.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-cyan/15 border border-cyan/35 text-cyan text-sm flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{successMsg} Chuyển hướng sau giây lát...</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-silver/80 text-xs font-semibold uppercase tracking-wider">Họ và tên *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-cyan/60" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-silver/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-silver/80 text-xs font-semibold uppercase tracking-wider">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-cyan/60" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0987654321"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-silver/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-silver/80 text-xs font-semibold uppercase tracking-wider">Địa chỉ Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan/60" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-silver/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-silver/80 text-xs font-semibold uppercase tracking-wider">Mật khẩu *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan/60" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-silver/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-silver/80 text-xs font-semibold uppercase tracking-wider">Bạn là ai?</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-[#12192b] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent transition-all"
              >
                <option value="customer">👤 Khách hàng (Tìm kiếm dịch vụ)</option>
                <option value="vendor">🏢 Vendor (Cung cấp gói dịch vụ)</option>
              </select>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-6 py-3 rounded-xl bg-cyan text-navy font-bold text-sm uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cyan-glow"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang xử lý đăng ký...
                </>
              ) : (
                <>
                  Đăng Ký Tài Khoản
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-silver/40 text-xs mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-cyan hover:underline font-semibold">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
