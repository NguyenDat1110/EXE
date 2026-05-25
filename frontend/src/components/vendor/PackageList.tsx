import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

const packages = [
  {
    id: 1,
    name: 'Gói Cơ Bản (Essential)',
    priceRange: '30M - 50M VND',
    guestRange: '50 - 100 khách',
    description: 'Gói trang trí tiêu chuẩn phù hợp cho các sự kiện quy mô nhỏ, tập trung vào điểm nhấn chính.',
    includes: [
      'Backdrop chụp hình tiêu chuẩn (3x4m)',
      'Bàn gallery đón khách',
      'Hoa lụa trang trí cao cấp',
      'Thiết kế 2D concept',
      'Hỗ trợ setup & tháo dỡ'
    ]
  },
  {
    id: 2,
    name: 'Gói Cao Cấp (Premium)',
    priceRange: '80M - 150M VND',
    guestRange: '100 - 300 khách',
    description: 'Trải nghiệm không gian sự kiện đẳng cấp với thiết kế độc bản và hoa tươi 100%.',
    includes: [
      'Backdrop 3D thiết kế riêng (4x6m)',
      'Đường dẫn hoa tươi & ánh sáng',
      'Trang trí bàn tiệc VIP',
      'Thiết kế 3D concept & render',
      'Hoa tươi nhập khẩu 100%',
      'Nhân sự trực sự kiện'
    ]
  },
  {
    id: 3,
    name: 'Gói Siêu Cấp (Luxury)',
    priceRange: 'Từ 200M VND',
    guestRange: 'Trên 300 khách',
    description: 'Giải pháp toàn diện cho các siêu sự kiện, kết hợp công nghệ ánh sáng và thiết kế không giới hạn.',
    includes: [
      'Concept thiết kế không giới hạn',
      'Hệ thống LED matrix & Kinetic',
      'Trang trí trần & không gian toàn diện',
      'Mô hình 360° VR preview',
      'Đạo diễn hình ảnh & ánh sáng',
      'Ekip thi công chuyên nghiệp 24/7'
    ]
  }
];

export default function PackageList({ navigate, vendorId }: { navigate: (page: string, params?: any) => void, vendorId: any }) {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-serif italic text-white mb-4">Các Gói Dịch Vụ</h3>
      <div className="space-y-3">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`glass-card rounded-xl overflow-hidden transition-colors ${expandedId === pkg.id ? 'border-primary/30 bg-white/5' : 'border-white/5 hover:border-white/20'}`}
          >
            <button 
              className="w-full p-4 flex items-center justify-between text-left"
              onClick={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
            >
              <div>
                <h4 className="text-white font-bold mb-1">{pkg.name}</h4>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="text-primary">{pkg.priceRange}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>{pkg.guestRange}</span>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === pkg.id ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {expandedId === pkg.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-white/5 mt-2">
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                      {pkg.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {pkg.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => navigate('booking', { vendorId, packageId: pkg.id })}
                      className="w-full py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-background-dark transition-all"
                    >
                      Chọn Gói Này
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
