import { LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng Quan', path: 'admin-dashboard' },
  { icon: Users, label: 'Duyệt Vendor', path: 'admin-vendors' },
  { icon: CreditCard, label: 'Giao Dịch', path: 'admin-transactions' },
  { icon: Settings, label: 'Cài Đặt', path: 'admin-settings' },
];

export default function AdminSidebar({ navigate, currentPage }: { navigate: (page: string, params?: any) => void, currentPage: string }) {
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
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-primary font-bold">AD</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Admin Portal</h3>
            <p className="text-xs text-primary">Quản trị viên</p>
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

    </aside>
  );
}
