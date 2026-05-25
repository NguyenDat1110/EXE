import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { clsx } from 'clsx';
import { loginSchema, LoginFormData } from '../../../lib/schemas';
import { useAuthStore, type UserRole } from '../../../store/authStore';

interface LoginFormProps {
  onSuccess: (role: UserRole) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [showToast, setShowToast] = useState(false);

  const { isLoading, login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'customer',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, selectedRole);
      setShowToast(true);
      setTimeout(() => {
        onSuccess(selectedRole);
      }, 500);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const roleOptions = [
    { id: 'customer', label: '👤 Khách Hàng', icon: '👤' },
    { id: 'vendor', label: '🏢 Vendor', icon: '🏢' },
    { id: 'admin', label: '🛡️ Admin', icon: '🛡️' },
  ] as const;

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-6"
    >
      {/* Logo & Heading */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-display text-4xl text-white">CLICKPICK</h1>
        <h2 className="font-display text-2xl text-silver">Chào mừng trở lại</h2>
      </div>

      {/* Role Selector */}
      <div className="space-y-3">
        <label className="text-silver text-sm font-medium">Loại tài khoản</label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map(role => (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id as UserRole)}
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
            {...register('email')}
            className={clsx(
              'w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
              'transition-all focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent',
              errors.email && 'ring-2 ring-red-500 border-red-500'
            )}
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
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
            {...register('password')}
            className={clsx(
              'w-full pl-10 pr-10 py-2.5 rounded-lg glass-panel bg-white/5 text-white placeholder:text-silver/40',
              'transition-all focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent',
              errors.password && 'ring-2 ring-red-500 border-red-500'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-cyan/60 hover:text-cyan transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
      </div>

      {/* Remember & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-cyan"
          />
          <span className="text-silver/60 text-sm">Ghi nhớ đăng nhập</span>
        </label>
        <button
          type="button"
          className="text-cyan hover:text-cyan/80 text-sm font-medium transition-colors"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={clsx(
          'w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
          'bg-gradient-to-r from-cyan to-cyan/70 text-navy hover:shadow-lg hover:shadow-cyan/30',
          isLoading && 'opacity-75 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          'Đăng Nhập'
        )}
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-silver/60 text-sm">hoặc</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google Login */}
      <button
        type="button"
        className="w-full py-2.5 rounded-lg glass-panel hover:glass-active transition-all font-medium text-white border border-white/10 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Đăng nhập với Google
      </button>

      {/* Register Link */}
      <p className="text-center text-silver/60 text-sm">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          className="text-cyan hover:text-cyan/80 font-semibold transition-colors"
        >
          Đăng ký ngay
        </button>
      </p>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-emerald-400 text-sm font-medium"
        >
          ✓ Đăng nhập thành công 👋
        </motion.div>
      )}
    </motion.form>
  );
}
