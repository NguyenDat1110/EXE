import React from 'react';
import { Shield, Users, FileText, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Admin Dashboard</h1>
          <p className="text-silver/60 mt-1">Tổng quan quản trị hệ thống và kiểm duyệt.</p>
        </div>
        <div className="bg-cyan/10 border border-cyan/30 px-4 py-2 rounded-full flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan">Admin Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Tổng thành viên</p>
            <p className="text-2xl font-bold font-sans mt-1">1,280</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Yêu cầu duyệt</p>
            <p className="text-2xl font-bold font-sans mt-1">12</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Bài viết mới</p>
            <p className="text-2xl font-bold font-sans mt-1">45</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan/15 rounded-xl text-cyan">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-silver/60 text-xs uppercase tracking-wider">Giao dịch chờ đối soát</p>
            <p className="text-2xl font-bold font-sans mt-1">8</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Trang Admin Dashboard</h2>
        <p className="text-silver/70 leading-relaxed">
          Giao diện quản lý dành riêng cho tài khoản có quyền <code className="bg-white/10 px-2 py-1 rounded text-cyan font-mono text-xs">admin</code>. 
          Các module chính bao gồm Quản lý hệ thống, Quản lý tài khoản đối tác & khách hàng, Kiểm duyệt bài viết và Đối soát thanh toán.
        </p>
      </div>
    </div>
  );
}
