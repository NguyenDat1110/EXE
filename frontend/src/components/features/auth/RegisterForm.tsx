import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Phone, User, Building, FileText, Clock, Loader, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import {
  registerStep1Schema,
  registerStep2CustomerSchema,
  registerStep2VendorSchema,
  RegisterStep1Data,
  RegisterStep2CustomerData,
  RegisterStep2VendorData,
} from '../../../lib/schemas';
import { useAuthStore, type UserRole } from '../../../store/authStore';
import { FileUpload } from '../../ui/FileUpload';
import { PasswordStrength } from '../../ui/PasswordStrength';

interface RegisterFormProps {
  onSuccess: (role: UserRole) => void;
  onBackToLogin: () => void;
}

export function RegisterForm({ onSuccess, onBackToLogin }: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [portfolio, setPortfolio] = useState<File[]>([]);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { isLoading, register } = useAuthStore();

  // Step 1 form
  const {
    register: registerField,
    handleSubmit: handleStep1Submit,
    watch,
    formState: { errors: errors1 },
  } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      role: 'customer',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const step1Data = watch();
  const passwordValue = watch('password');

  const onStep1Submit = async (data: RegisterStep1Data) => {
    setSelectedRole(data.role);
    setStep(2);
  };

  const onStep2Submit = async () => {
    if (!step1Data) return;

    try {
      setIsSubmitting(true);

      if (selectedRole === 'vendor' && !businessLicense) {
        alert('Giấy phép kinh doanh là bắt buộc');
        setIsSubmitting(false);
        return;
      }

      // Simulate pending review
      setIsPending(true);
      await new Promise(r => setTimeout(r, 2000));

      await register({
        ...step1Data,
        role: selectedRole,
      });

      onSuccess(selectedRole);
    } catch (error) {
      console.error('Registration failed:', error);
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { id: 'customer', label: '👤 Khách Hàng', icon: '👤' },
    { id: 'vendor', label: '🏢 Vendor', icon: '🏢' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl text-white">CLICKPICK</h1>
        <h2 className="font-display text-2xl text-silver">Đăng Ký</h2>
        <p className="text-silver/60 text-sm">
          Bước {step} của {selectedRole === 'customer' ? 2 : 2}
        </p>
      </div>

      {/* Step 1: Basic Info */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            onSubmit={handleStep1Submit(onStep1Submit)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Role Selector */}
            <div className="space-y-3">
              <label className="text-silver text-sm font-medium">Loại tài khoản</label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map(role => (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id as UserRole);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'px-3 py-2 rounded-lg font-medium text-sm transition-all',
                      selectedRole === role.id
                        ? 'glass-active border-cyan'
                        : 'glass-panel hover:border-white/20'
                    )}
                  >
                    {role.icon}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-silver text-sm font-medium">
                Họ tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                <input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  {...registerField('name')}
                  className={clsx(
                    'w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-cyan',
                    errors1.name && 'ring-2 ring-red-500'
                  )}
                />
              </div>
              {errors1.name && <p className="text-red-400 text-xs">{errors1.name.message}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-silver text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...registerField('email')}
                  className={clsx(
                    'w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-cyan',
                    errors1.email && 'ring-2 ring-red-500'
                  )}
                />
              </div>
              {errors1.email && <p className="text-red-400 text-xs">{errors1.email.message}</p>}
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-silver text-sm font-medium">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                <input
                  id="phone"
                  placeholder="0123456789"
                  {...registerField('phone')}
                  className={clsx(
                    'w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-cyan',
                    errors1.phone && 'ring-2 ring-red-500'
                  )}
                />
              </div>
              {errors1.phone && <p className="text-red-400 text-xs">{errors1.phone.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-silver text-sm font-medium">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  {...registerField('password')}
                  className={clsx(
                    'w-full pl-10 pr-10 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-cyan',
                    errors1.password && 'ring-2 ring-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-cyan/60 hover:text-cyan"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors1.password && <p className="text-red-400 text-xs">{errors1.password.message}</p>}
              {passwordValue && <PasswordStrength password={passwordValue} />}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-silver text-sm font-medium">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                <input
                  id="confirmPassword"
                  type={showPassword2 ? 'text' : 'password'}
                  placeholder="••••••"
                  {...registerField('confirmPassword')}
                  className={clsx(
                    'w-full pl-10 pr-10 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-cyan',
                    errors1.confirmPassword && 'ring-2 ring-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-3.5 text-cyan/60 hover:text-cyan"
                >
                  {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors1.confirmPassword && <p className="text-red-400 text-xs">{errors1.confirmPassword.message}</p>}
            </div>

            {/* Continue Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-cyan to-cyan/70 text-navy hover:shadow-lg hover:shadow-cyan/30 transition-all flex items-center justify-center gap-2"
            >
              Tiếp Tục <ChevronRight className="w-4 h-4" />
            </motion.button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full text-silver/60 hover:text-silver transition-colors text-sm"
            >
              ← Quay lại
            </button>
          </motion.form>
        )}

        {/* Step 2: Role-Specific */}
        {step === 2 && !isPending && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {selectedRole === 'customer' ? (
              <>
                {/* Customer Step 2 */}
                <div className="space-y-3">
                  <label className="text-silver text-sm font-medium">Tỉnh/Thành phố</label>
                  <select className="w-full px-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan transition-all">
                    <option value="">Chọn tỉnh/thành phố</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="hn">Hà Nội</option>
                    <option value="dn">Đà Nẵng</option>
                    <option value="ct">Cần Thơ</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-silver text-sm font-medium">Ngày sinh (Tùy chọn)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan transition-all"
                  />
                </div>

                <motion.button
                  type="button"
                  onClick={onStep2Submit}
                  disabled={isSubmitting || isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={clsx(
                    'w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
                    'bg-gradient-to-r from-cyan to-cyan/70 text-navy hover:shadow-lg hover:shadow-cyan/30',
                    (isSubmitting || isLoading) && 'opacity-75 cursor-not-allowed'
                  )}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Hoàn Tất Đăng Ký'
                  )}
                </motion.button>
              </>
            ) : (
              <>
                {/* Vendor Step 2 */}
                <div className="space-y-2">
                  <label className="text-silver text-sm font-medium">Tên công ty</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                    <input
                      type="text"
                      placeholder="Tên công ty"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-silver text-sm font-medium">Mã số thuế</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 w-5 h-5 text-cyan/60" />
                    <input
                      type="text"
                      placeholder="Mã số thuế"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-silver text-sm font-medium">Địa chỉ văn phòng</label>
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    className="w-full px-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-silver text-sm font-medium">Giấy phép kinh doanh *</label>
                  <FileUpload
                    onFilesSelected={(files) => setBusinessLicense(files[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={10 * 1024 * 1024}
                    maxFiles={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-silver text-sm font-medium">Mô tả ngắn (Tùy chọn)</label>
                  <textarea
                    placeholder="Mô tả về doanh nghiệp (tối đa 300 ký tự)"
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan transition-all resize-none h-24"
                  />
                </div>

                <motion.button
                  type="button"
                  onClick={onStep2Submit}
                  disabled={isSubmitting || isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={clsx(
                    'w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
                    'bg-gradient-to-r from-cyan to-cyan/70 text-navy hover:shadow-lg hover:shadow-cyan/30',
                    (isSubmitting || isLoading) && 'opacity-75 cursor-not-allowed'
                  )}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Gửi Hồ Sơ Xét Duyệt'
                  )}
                </motion.button>
              </>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-silver/60 hover:text-silver transition-colors text-sm"
            >
              ← Quay lại
            </button>
          </motion.div>
        )}

        {/* Pending Review Screen */}
        {isPending && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6 py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Clock className="w-16 h-16 text-cyan mx-auto" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl text-white">Hồ sơ đang được xét duyệt</h3>
              <p className="text-silver/60">Thời gian xét duyệt: 1-3 ngày làm việc</p>
            </div>
            <p className="text-silver/40 text-sm">
              Chúng tôi sẽ gửi email thông báo kết quả cho bạn
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
