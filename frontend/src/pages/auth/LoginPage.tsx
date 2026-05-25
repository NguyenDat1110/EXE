import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/features/auth/LoginForm';
import { RegisterForm } from '../../components/features/auth/RegisterForm';
import type { UserRole } from '../../store/authStore';

export function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (role: UserRole) => {
    setTimeout(() => {
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'vendor':
          navigate('/vendor/dashboard');
          break;
        case 'customer':
          navigate('/explore');
          break;
        default:
          navigate('/');
      }
    }, 500);
  };

  const handleRegisterSuccess = (role: UserRole) => {
    setTimeout(() => {
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'vendor':
          navigate('/vendor/dashboard');
          break;
        case 'customer':
          navigate('/explore');
          break;
        default:
          navigate('/');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left Half - Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1519671482677-504be0ffbc87?w=800&q=80)',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />

        {/* Watermark & Quote */}
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="font-display text-5xl text-white/30">CLICKPICK</h2>
            <p className="text-white/60 text-lg font-serif max-w-xs italic">
              "Biến mỗi sự kiện thành một trải nghiệm đáng nhớ"
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Half - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {showRegister ? (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onBackToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onSuccess={handleLoginSuccess}
            />
          )}

          {/* Toggle between login and register */}
          {!showRegister && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => setShowRegister(true)}
                className="text-silver/60 hover:text-silver transition-colors"
              >
                Chưa có tài khoản?{' '}
                <span className="text-cyan font-semibold">Đăng ký ngay</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
