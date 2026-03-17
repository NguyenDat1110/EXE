import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialPackages = [
  {
    id: 1,
    name: 'Gói Cơ Bản (Essential)',
    priceRange: '30M - 50M VND',
    guestRange: '50 - 100 khách',
    description: 'Gói trang trí tiêu chuẩn phù hợp cho các sự kiện quy mô nhỏ, tập trung vào điểm nhấn chính.',
    active: true
  },
  {
    id: 2,
    name: 'Gói Cao Cấp (Premium)',
    priceRange: '80M - 150M VND',
    guestRange: '100 - 300 khách',
    description: 'Trải nghiệm không gian sự kiện đẳng cấp với thiết kế độc bản và hoa tươi 100%.',
    active: true
  },
  {
    id: 3,
    name: 'Gói Siêu Cấp (Luxury)',
    priceRange: 'Từ 200M VND',
    guestRange: 'Trên 300 khách',
    description: 'Giải pháp toàn diện cho các siêu sự kiện, kết hợp công nghệ ánh sáng và thiết kế không giới hạn.',
    active: false
  }
];

export default function PackageManager({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const toggleActive = (id: number) => {
    setPackages(packages.map(pkg => pkg.id === id ? { ...pkg, active: !pkg.active } : pkg));
    showToast('Đã cập nhật trạng thái gói dịch vụ', 'success');
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleSave = () => {
    closeModal();
    showToast(editingPackage ? 'Đã cập nhật gói dịch vụ' : 'Đã thêm gói dịch vụ mới', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Quản Lý Gói Dịch Vụ</h2>
        <button 
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 hover:brightness-110 transition-all cyan-glow text-sm uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" /> Thêm Gói Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`glass-card rounded-2xl p-6 flex flex-col transition-all ${pkg.active ? 'border-primary/20' : 'opacity-60 grayscale'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
              <button 
                onClick={() => toggleActive(pkg.id)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${pkg.active ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pkg.active ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Mức giá:</span>
                <span className="text-primary font-medium">{pkg.priceRange}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Số khách:</span>
                <span className="text-white font-medium">{pkg.guestRange}</span>
              </div>
              <p className="text-sm text-slate-400 mt-4 line-clamp-3">{pkg.description}</p>
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
              <button 
                onClick={() => handleEdit(pkg)}
                className="flex-1 py-2 glass-card text-slate-300 font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Edit2 className="w-4 h-4" /> Sửa
              </button>
              <button className="p-2 glass-card text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl w-full max-w-2xl bg-background-dark overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold text-white">{editingPackage ? 'Sửa Gói Dịch Vụ' : 'Thêm Gói Mới'}</h2>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tên Gói</label>
                  <input 
                    type="text" 
                    defaultValue={editingPackage?.name}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mức Giá (VND)</label>
                    <input 
                      type="text" 
                      defaultValue={editingPackage?.priceRange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Số Khách</label>
                    <input 
                      type="text" 
                      defaultValue={editingPackage?.guestRange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mô Tả</label>
                  <textarea 
                    rows={3}
                    defaultValue={editingPackage?.description}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between items-center">
                    <span>Hạng Mục Bao Gồm</span>
                    <button className="text-primary text-xs hover:underline">+ Thêm mục</button>
                  </label>
                  <div className="space-y-2">
                    {['Backdrop chụp hình tiêu chuẩn (3x4m)', 'Bàn gallery đón khách', 'Hoa lụa trang trí cao cấp'].map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          defaultValue={item}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                        <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-background-dark sticky bottom-0 flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 glass-card text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                  Hủy
                </button>
                <button onClick={handleSave} className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all cyan-glow flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Lưu Thay Đổi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
