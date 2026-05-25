import React from 'react';
import VendorSidebar from '../../components/vendor-dashboard/VendorSidebar';

export default function CalendarPage({ navigate, pageParams }: { navigate: (page: string, params?: any) => void, pageParams: any }) {
  return (
    <div className="flex min-h-screen bg-background-dark">
      <VendorSidebar navigate={navigate} currentPage="vendor-calendar" />
      <main className="flex-1 p-8 lg:p-12 ml-0 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-white mb-2">Lịch Sự Kiện</h1>
              <p className="text-slate-400">Quản lý lịch trình và các sự kiện sắp tới.</p>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-8 border border-white/10 text-center text-slate-400">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl text-white mb-2">Tính năng đang phát triển</h3>
            <p>Lịch sự kiện sẽ sớm ra mắt trong phiên bản tiếp theo.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
