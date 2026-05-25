import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col font-sans selection:bg-cyan/30 selection:text-white">
      <div className="grain-overlay" />

      {/* Transparent glassmorphism header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 lg:px-20 border-b border-white/10 bg-navy/80 backdrop-blur-md z-40">
        <Link to="/" className="flex items-center gap-3">
          <div className="text-cyan">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-widest font-manrope text-white">CLICKPICK</h2>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/explore" className="text-sm font-medium uppercase tracking-widest text-silver hover:text-cyan transition-colors">
            Khám Phá
          </Link>
          {isAuthenticated && user?.role === 'vendor' && (
            <Link to="/vendor/dashboard" className="text-sm font-medium uppercase tracking-widest text-silver hover:text-cyan transition-colors">
              Dashboard Vendor
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="text-sm font-medium uppercase tracking-widest text-silver hover:text-cyan transition-colors">
              Dashboard Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity focus:outline-none"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-cyan/40 object-cover"
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-xl p-3 space-y-2 z-50 bg-navy/95"
                    >
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-silver/60 text-xs capitalize font-medium">{user.role}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (user.role === 'admin') navigate('/admin/dashboard');
                          else if (user.role === 'vendor') navigate('/vendor/dashboard');
                          else navigate('/explore');
                        }}
                        className="w-full text-left px-3 py-2 text-silver hover:text-cyan hover:bg-white/5 rounded-lg transition-all text-sm"
                      >
                        Bàn Làm Việc
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng Xuất
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link
                to="/login"
                className="flex items-center justify-center rounded-full h-11 px-6 border border-cyan text-cyan text-sm font-bold uppercase tracking-wider hover:bg-cyan/10 transition-all duration-300"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center rounded-full h-11 px-6 bg-cyan text-navy text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all duration-300 cyan-glow"
              >
                Đăng Ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-silver hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-20 left-0 right-0 bg-navy/95 border-b border-white/10 z-30 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-silver hover:text-cyan transition-colors"
              >
                Khám Phá
              </Link>
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-lg border border-cyan text-cyan font-bold"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-lg bg-cyan text-navy font-bold"
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-12 border-t border-white/10 bg-navy mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-cyan/60">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-widest font-manrope text-white/60">CLICKPICK</h2>
          </div>
          <p className="text-slate-500 text-xs uppercase tracking-widest">© 2026 CLICKPICK VIETNAM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
