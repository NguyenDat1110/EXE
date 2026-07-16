import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Search, CalendarDays, LogOut, User, Rss } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationDropdown } from '../common/NotificationDropdown';

export function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore/birthday?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col font-sans">
      <div className="grain-overlay" />

      {/* Authenticated Customer Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 lg:px-8 border-b border-white/10 bg-navy/90 backdrop-blur-md z-40">
        {/* Logo */}
        <Link to="/explore" className="flex items-center gap-3">
          <div className="text-cyan">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-widest font-manrope text-white hidden sm:block">CLICKPICK</h2>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-silver/40" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, vendor, gói sự kiện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full glass-panel bg-white/5 border border-white/10 text-white placeholder:text-silver/40 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm transition-all"
            />
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Timeline shortcut */}
          <Link
            to="/timeline"
            title="Dòng thời gian"
            className="p-2 text-silver hover:text-cyan hover:bg-white/5 rounded-full transition-colors"
          >
            <Rss className="w-5 h-5" />
          </Link>

          <Link
            to="/my-bookings"
            title="Đơn đặt chỗ của tôi"
            className="p-2 text-silver hover:text-cyan hover:bg-white/5 rounded-full transition-colors relative"
          >
            <CalendarDays className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan rounded-full" />
          </Link>

          <NotificationDropdown />

          {/* User Profile Dropdown */}
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
                      className="absolute right-[-8px] md:right-[-16px] lg:right-[-24px] top-full mt-2 w-52 glass-panel rounded-xl p-3 space-y-2 z-50 bg-navy/95"
                    >
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-cyan text-xs font-semibold uppercase tracking-wider">Khách Hàng</p>
                      </div>
                      <Link
                        to="/timeline"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-silver hover:text-cyan hover:bg-white/5 rounded-lg transition-all text-sm"
                      >
                        <Rss className="w-4 h-4" />
                        Dòng Thời Gian
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-silver hover:text-cyan hover:bg-white/5 rounded-lg transition-all text-sm"
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ cá nhân
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm flex items-center gap-2 border-t border-white/10 mt-2 pt-2"
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

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-12 px-6 lg:px-20 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}