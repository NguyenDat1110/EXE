import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, type UserRole } from '../../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  onRedirect?: (role: UserRole | null) => void;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
  onRedirect,
}: ProtectedRouteProps) {
  const { isAuthenticated, role, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    if (onRedirect) {
      onRedirect(null);
    }
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-silver">Đang chuyển hướng...</p>
        </motion.div>
      </div>
    );
  }

  if (requiredRoles && role && !requiredRoles.includes(role)) {
    if (onRedirect) {
      onRedirect(role);
    }
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-silver">Bạn không có quyền truy cập trang này</p>
        </motion.div>
      </div>
    );
  }

  // Show skeleton loader while auth is being verified
  return (
    <>
      {children}
    </>
  );
}
