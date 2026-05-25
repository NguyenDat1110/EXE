import { LayoutDashboard, CalendarDays, Package, Settings, LogOut } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng Quan', path: 'vendor-dashboard' },
  { icon: CalendarDays, label: 'Lịch Trình', path: 'vendor-calendar' },
  { icon: Package, label: 'Quản Lý Gói', path: 'vendor-packages' },
  { icon: Settings, label: 'Cài Đặt', path: 'vendor-settings' },
];

export default function VendorSidebar({ navigate, currentPage }: { navigate: (page: string, params?: any) => void, currentPage: string }) {
  return (
    <aside className="w-64 hidden lg:flex flex-col bg-background-dark border-r border-white/10 h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-primary">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-widest font-manrope text-white">CLICKPICK</h2>
        </div>
        <div className="flex items-center gap-3">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp" 
            alt="Vendor" 
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <div>
            <h3 className="text-sm font-bold text-white">Lumina Events</h3>
            <p className="text-xs text-primary">Vendor Đối Tác</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 cyan-glow' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={() => navigate('home')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut className="w-5 h-5" />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
}
