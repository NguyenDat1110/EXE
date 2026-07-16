import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Briefcase, LogOut, Menu, X, User, FileCheck, Zap, Newspaper, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationDropdown } from '../common/NotificationDropdown';

export function VendorLayout() {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Quản Lí Gian Hàng', path: '/vendor/packages', icon: Briefcase },
    { label: 'Bài Viết', path: '/vendor/posts', icon: Newspaper },

    { label: 'Đánh giá', path: '/vendor/reviews', icon: Star },

    { label: 'Đánh Giá', path: '/vendor/feedback', icon: Star },
    { label: 'Hồ sơ', path: '/vendor/profile', icon: User },
    { label: 'Đăng Kí Doanh Nghiệp', path: '/vendor/registration', icon: FileCheck },
    { label: 'Nâng Cấp Gói', path: '/vendor/subscription', icon: Zap },
    { label: 'Thiết Kế Sân Khấu (Demo)', path: '/vendor/stage-builder-demo', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-navy text-white flex font-sans">
      <div className="grain-overlay" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-navy/95 shrink-0 z-30">
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="text-cyan">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-widest font-manrope text-white">VENDOR</h2>
          </Link>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan/15 text-cyan border border-cyan/35 cyan-glow'
                    : 'text-silver hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-navy/95 border-r border-white/10 z-50 flex flex-col lg:hidden"
            >
              <div className="h-20 flex items-center justify-between px-8 border-b border-white/10">
                <Link to="/" className="flex items-center gap-3">
                  <div className="text-cyan">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold tracking-widest font-manrope text-white">VENDOR</h2>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-silver hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-grow p-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan/15 text-cyan border border-cyan/35'
                          : 'text-silver hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng Xuất
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-white/10 bg-navy/80 backdrop-blur-md sticky top-0 z-35">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-silver hover:text-white focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white capitalize hidden sm:block">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">

            <NotificationDropdown />


            {user && (
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
                          <p className="text-cyan text-xs font-semibold uppercase tracking-wider">Vendor</p>
                        </div>
                        <Link
                          to="/vendor/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="block w-full text-left px-3 py-2 text-silver hover:text-cyan hover:bg-white/5 rounded-lg transition-all text-sm flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Hồ sơ doanh nghiệp
                        </Link>
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
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-grow p-6 lg:p-12 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
