import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowUp, X, CheckCircle, Info, AlertCircle, Bell, LogOut, Settings } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import VendorListPage from './pages/VendorListPage';
import VendorProfilePage from './pages/VendorProfilePage';
import BookingPage from './pages/BookingPage';
import VendorDashboardPage from './pages/vendor/DashboardPage';
import PackagesPage from './pages/vendor/PackagesPage';
import CalendarPage from './pages/vendor/CalendarPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import VendorsPage from './pages/admin/VendorsPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { CustomerProfile } from './pages/profile/CustomerProfile';
import { VendorProfile } from './pages/profile/VendorProfile';
import { useAuthStore } from './store/authStore';
import { Avatar } from './components/ui/Avatar';
import type { UserRole } from './lib/schemas';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'profile-customer':
        return <CustomerProfile />;
      case 'profile-vendor':
        return <VendorProfile />;
      case 'home':
        return <LandingPage navigate={navigate} />;
      case 'vendor-list':
        return <VendorListPage navigate={navigate} />;
      case 'vendor-detail':
        return <VendorProfilePage navigate={navigate} pageParams={pageParams} />;
      case 'booking':
        return <BookingPage navigate={navigate} pageParams={pageParams} showToast={showToast} />;
      case 'vendor-dashboard':
        return <VendorDashboardPage navigate={navigate} pageParams={pageParams} showToast={showToast} />;
      case 'vendor-packages':
        return <PackagesPage navigate={navigate} pageParams={pageParams} showToast={showToast} />;
      case 'vendor-calendar':
        return <CalendarPage navigate={navigate} pageParams={pageParams} />;
      case 'admin-dashboard':
        return <AdminDashboardPage navigate={navigate} pageParams={pageParams} />;
      case 'admin-vendors':
        return <VendorsPage navigate={navigate} pageParams={pageParams} showToast={showToast} />;
      case 'admin-transactions':
        return <TransactionsPage navigate={navigate} pageParams={pageParams} />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  const renderBreadcrumb = () => {
    if (currentPage === 'home') return null;

    let path = [{ label: 'Trang chủ', page: 'home' }];
    
    if (currentPage.startsWith('vendor-') && currentPage !== 'vendor-list' && !currentPage.includes('dashboard') && !currentPage.includes('packages') && !currentPage.includes('calendar')) {
      path.push({ label: 'Khám Phá', page: 'vendor-list' });
      if (currentPage === 'vendor-detail') {
        path.push({ label: 'Chi Tiết Vendor', page: currentPage });
      }
    } else if (currentPage === 'vendor-list') {
      path.push({ label: 'Khám Phá', page: 'vendor-list' });
    } else if (currentPage === 'booking') {
      path.push({ label: 'Khám Phá', page: 'vendor-list' });
      path.push({ label: 'Đặt Dịch Vụ', page: 'booking' });
    } else if (currentPage.startsWith('admin-')) {
      path.push({ label: 'Admin', page: 'admin-dashboard' });
      if (currentPage === 'admin-vendors') path.push({ label: 'Xét Duyệt Vendor', page: 'admin-vendors' });
      if (currentPage === 'admin-transactions') path.push({ label: 'Giao Dịch', page: 'admin-transactions' });
    } else if (currentPage.startsWith('vendor-') && (currentPage.includes('dashboard') || currentPage.includes('packages') || currentPage.includes('calendar'))) {
      path.push({ label: 'Đối Tác', page: 'vendor-dashboard' });
      if (currentPage === 'vendor-packages') path.push({ label: 'Gói Dịch Vụ', page: 'vendor-packages' });
      if (currentPage === 'vendor-calendar') path.push({ label: 'Lịch Sự Kiện', page: 'vendor-calendar' });
    }

    return (
      <div className="fixed top-20 left-6 lg:left-20 z-30 flex items-center gap-2 text-xs font-medium text-slate-400 bg-background-dark/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {path.map((item, index) => (
          <React.Fragment key={index}>
            <button 
              onClick={() => navigate(item.page, item.page === 'vendor-detail' ? pageParams : {})}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </button>
            {index < path.length - 1 && <ChevronRight className="w-3 h-3" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-dark text-white font-sans selection:bg-primary/30 selection:text-white">
      {/* Global Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 lg:px-20 border-b border-white/10 bg-background-dark/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('home')}>
          <div className="text-primary">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-widest font-manrope text-white">CLICKPICK</h2>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => navigate('vendor-list')}
            className={`text-sm font-medium transition-colors uppercase tracking-widest ${currentPage === 'vendor-list' ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
          >
            Khám Phá
          </button>
          <button 
            onClick={() => navigate('vendor-dashboard')}
            className={`text-sm font-medium transition-colors uppercase tracking-widest ${currentPage.startsWith('vendor-') && currentPage !== 'vendor-list' && currentPage !== 'vendor-detail' ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
          >
            Đối Tác
          </button>
          <button 
            onClick={() => navigate('admin-dashboard')}
            className={`text-sm font-medium transition-colors uppercase tracking-widest ${currentPage.startsWith('admin-') ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
          >
            Admin
          </button>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <button className="relative text-silver/60 hover:text-cyan transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar src={user.avatar} alt={user.name} size="sm" />
                </button>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-xl p-3 space-y-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-silver/60 text-xs capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        const page = user.role === 'customer' ? 'profile-customer' : 'profile-vendor';
                        navigate(page);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-silver hover:text-white hover:bg-white/5 rounded transition-colors text-sm"
                    >
                      Hồ Sơ
                    </button>
                    <button
                      onClick={() => {
                        navigate(user.role === 'customer' ? 'home' : 'vendor-dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-silver hover:text-white hover:bg-white/5 rounded transition-colors text-sm"
                    >
                      Dashboard
                    </button>
                    <button className="w-full text-left px-3 py-2 text-silver hover:text-white hover:bg-white/5 rounded transition-colors text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Cài Đặt
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate('home');
                        setShowProfileMenu(false);
                        showToast('Đã đăng xuất', 'success');
                      }}
                      className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors text-sm border-t border-white/10 mt-2 pt-2 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng Xuất
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('login')}
                className="hidden sm:flex items-center justify-center rounded-full h-11 px-8 bg-transparent border border-cyan text-cyan text-sm font-bold uppercase tracking-widest hover:bg-cyan/10 transition-all"
              >
                Đăng Nhập
              </button>
              <button 
                onClick={() => navigate('vendor-list')}
                className="hidden sm:flex items-center justify-center rounded-full h-11 px-8 bg-primary text-background-dark text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all cyan-glow"
              >
                Inquire
              </button>
            </>
          )}
        </div>
      </header>

      {renderBreadcrumb()}

      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      {(currentPage === 'home' || currentPage === 'vendor-list' || currentPage === 'vendor-detail') && (
        <footer className="px-6 lg:px-20 py-12 border-t border-white/10 bg-background-dark mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="text-primary/60">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold tracking-widest font-manrope text-white/60">CLICKPICK</h2>
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-widest">© 2024 CLICKPICK VIETNAM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">share</span></button>
              <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">mail</span></button>
              <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">language</span></button>
            </div>
          </div>
        </footer>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md pointer-events-auto ${
                toast.type === 'success' ? 'bg-primary/10 border-primary/30 text-primary' :
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-white/5 border-white/10 text-white'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
              <span className="text-sm font-medium">{toast.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full glass-card border border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-lg shadow-primary/20"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
