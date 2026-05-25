import { Bell, Search, Menu } from 'lucide-react';
import VendorSidebar from '../../components/vendor-dashboard/VendorSidebar';
import PackageManager from '../../components/vendor-dashboard/PackageManager';

export default function PackagesPage({ navigate, pageParams, showToast }: { navigate: (page: string, params?: any) => void, pageParams: any, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  return (
    <>
      <div className="grain-overlay"></div>
      <div className="min-h-screen bg-background-dark text-slate-100 flex">
        <VendorSidebar navigate={navigate} currentPage="vendor-packages" />

        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Menu className="w-6 h-6 text-slate-400" />
              </button>
              <h1 className="text-xl font-bold text-white hidden sm:block">Quản Lý Gói</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <PackageManager showToast={showToast} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
