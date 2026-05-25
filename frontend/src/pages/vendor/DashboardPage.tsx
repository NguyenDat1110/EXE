import { Bell, Search, Menu } from 'lucide-react';
import VendorSidebar from '../../components/vendor-dashboard/VendorSidebar';
import StatCard from '../../components/vendor-dashboard/StatCard';
import BookingTable from '../../components/vendor-dashboard/BookingTable';
import CalendarWidget from '../../components/vendor-dashboard/CalendarWidget';
import { FileText, DollarSign, CalendarDays } from 'lucide-react';

export default function VendorDashboardPage({ navigate, pageParams, showToast }: { navigate: (page: string, params?: any) => void, pageParams: any, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  return (
    <>
      <div className="grain-overlay"></div>
      <div className="min-h-screen bg-background-dark text-slate-100 flex">
        <VendorSidebar navigate={navigate} currentPage="vendor-dashboard" />

        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Menu className="w-6 h-6 text-slate-400" />
              </button>
              <h1 className="text-xl font-bold text-white hidden sm:block">Tổng Quan</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm booking..." 
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors w-64"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Yêu Cầu Mới" 
                  value={12} 
                  icon={FileText} 
                  trend="up" 
                  trendValue="+4 so với tuần trước" 
                  hasNotification={true} 
                />
                <StatCard 
                  title="Doanh Thu Tháng" 
                  value={450000000} 
                  icon={DollarSign} 
                  trend="up" 
                  trendValue="+15% so với tháng trước" 
                  suffix="đ" 
                />
                <StatCard 
                  title="Ngày Kín Lịch" 
                  value={8} 
                  icon={CalendarDays} 
                  trend="neutral" 
                  trendValue="Trong tháng này" 
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-8">
                <div className="min-w-0">
                  <BookingTable showToast={showToast} />
                </div>
                <div className="space-y-8">
                  <CalendarWidget />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
