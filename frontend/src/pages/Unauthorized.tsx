import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="grain-overlay" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-6"
      >
        <div className="flex justify-center">
          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 animate-pulse">
            <ShieldAlert className="w-16 h-16" />
          </div>
        </div>
        <h1 className="text-4xl font-bold font-manrope text-white">403 - Unauthorized</h1>
        <p className="text-silver/60 text-base leading-relaxed">
          Tài khoản của bạn không được phân quyền để truy cập vào liên kết này. Vui lòng kiểm tra lại quyền truy cập hoặc quay lại trang chủ.
        </p>
        <div className="pt-4 flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan text-navy font-bold hover:brightness-110 transition-all duration-300 cyan-glow"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại Trang Chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
