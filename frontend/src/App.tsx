import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

// Layouts
import { PublicLayout } from './components/layouts/PublicLayout';
import { CustomerLayout } from './components/layouts/CustomerLayout';
import { VendorLayout } from './components/layouts/VendorLayout';
import { AdminLayout } from './components/layouts/AdminLayout';

// Guards
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleRoute } from './components/guards/RoleRoute';

// Pages
import LandingPage from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import Register from './pages/Register';
import Explore from './pages/customer/Explore';
import CustomerBookings from './pages/customer/Bookings';
import { CustomerProfile } from './pages/profile/CustomerProfile';
import { VendorProfile } from './pages/profile/VendorProfile';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorPackages from './pages/vendor/Packages';
import { VendorSubmissionStatus } from './pages/vendor/VendorSubmissionStatus';
import { VendorSubmissionForm } from './pages/vendor/VendorSubmissionForm';
import { SubscriptionPlans } from './pages/vendor/SubscriptionPlans';
import { SubscriptionCheckout } from './pages/vendor/SubscriptionCheckout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import { AdminVendors } from './pages/admin/AdminVendors';
import Unauthorized from './pages/Unauthorized';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-navy text-white font-sans selection:bg-cyan/30 selection:text-white">
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />



          {/* Customer Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['customer']} />}>
              <Route element={<CustomerLayout />}>
                <Route path="/explore" element={<Explore />} />
                <Route path="/my-bookings" element={<CustomerBookings />} />
                <Route path="/profile" element={<CustomerProfile />} />
              </Route>
            </Route>
          </Route>

          {/* Vendor Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['vendor']} />}>
              <Route element={<VendorLayout />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/packages" element={<VendorPackages />} />
                <Route path="/vendor/profile" element={<VendorProfile showToast={showToast} />} />
                <Route path="/vendor/registration" element={<VendorSubmissionStatus />} />
                <Route path="/vendor/registration/form" element={<VendorSubmissionForm />} />
                <Route path="/vendor/subscription" element={<SubscriptionPlans />} />
                <Route path="/vendor/subscription-checkout" element={<SubscriptionCheckout />} />
              </Route>
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/vendors" element={<AdminVendors />} />
              </Route>
            </Route>
          </Route>

          {/* Unauthorized and Redirect Fallbacks */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md pointer-events-auto ${
                  toast.type === 'success' ? 'bg-cyan/10 border-cyan/30 text-cyan' :
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
                  className="ml-2 opacity-50 hover:opacity-100 transition-opacity focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Global Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-40 p-3 rounded-full glass-card border border-cyan/30 text-cyan hover:bg-cyan/10 transition-colors shadow-lg shadow-cyan/20 focus:outline-none"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
