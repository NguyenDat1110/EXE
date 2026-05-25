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
      {/* Left Half - Event Vibe & Candle Light Effect */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80)',
          }}
        />
        
        {/* Animated Candlelight/Glow Effect */}
        <motion.div
          animate={{
            opacity: [0.25, 0.45, 0.25],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />

        {/* Watermark & Quote */}
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="font-display text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-md">CLICKPICK</h2>
            <p className="text-white/80 text-lg font-serif max-w-xs italic">
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

          {/* Toggle link */}
          {!showRegister && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => navigate('/register')}
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
