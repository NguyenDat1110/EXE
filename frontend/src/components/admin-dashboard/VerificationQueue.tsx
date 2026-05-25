import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Eye, FileText, ShieldCheck, X } from 'lucide-react';

const mockVendors = [
  { id: 1, name: 'Lumina Events', date: '20/10/2024', status: 'pending', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC_OYhVvyQSsbCQ4iHmmL5Xw0oYTLovxwHlMsTPxuuv9xGj2N-Lk5-W5C0X6MXlQUtPtbF9H7PXicjKEPr-KyN4kmHDrtYI0Xottda9hrBY3PEm_IXplI8VfUkXGnDrm5zk5NK6wOgnw0Tz29VeDjeZ8cmCjS6WYMM-DOH_XQnQ77lXC5BT2g6CCSoz6UhxjILgabC3ublJOOJJrkIT4-xQi19vALmqs0-WHfHjpQVfOe8QDk7-vFbnxaFvJxKCOTr6q4ON3lM9yOUp', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-a1GfhArV_6OIT-eU77u4aK2EmaD7_JXRXLU4Fy4ICqeAxbfFmJoFoZXKiHivg12PjhsZzhflKOIIiLrsP28gBFIvePI0--9F4HGdmEoKWs_CeshcN02dhH7gScnQFgqUDiAe4pGfGQFhsgW3k8Jr_cJ7WD1mzC_QtpcQLU9VEUmnbhYgorZQJkG1iIEZwcQ4jKc3a713dgu5-vYpBdQP8Jyn4oYBgp_D9Nbl-MlvD7YBooXEFPNqsdPV_nTOolu58XqbVt1fbOT', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO942zfFetWifa-AMjmMD9U-ziMEIVYzDYKO7TemxNVxzJ0GKiVGgPOskcYFFGqpQrAoFpANxZHzcexy_RIfAzZEiI2R1aNq8WcY6DJIiahxNgYVpIP2GNTjeqnGq3xbKQvuCYmF7hM2Tzk90PR7_NIYL-uXnQQW-1TOPWafS4dXO3BdpYEU-JdDfUR3qWonNr0gWniiuq6OEaS-DHLKtchlVAI8WFVmIDkLWPv1aKVGW9yzq4NBMpnAlCp_3822O8GEs_3OcO0C25'] },
  { id: 2, name: 'Glow Decor', date: '18/10/2024', status: 'pending', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSSdtH06b-33mo_UkMnC7Gt4nmeERhVsMTuwunstZSGQnE_CKzltg2a93wLbTYgP6ZIQA8scDmZ85fnNixfB0GQg9y3QhlpgPZyRC-uNKYHZPXLVs7JQ7Xs9aYavO6iEW8bSs5l3W78NCnsZm7ssH5e_LGf3fqadREGf5jhFwNOLF7OOlKK0BPSHWCuNjcCR12mV7ZgTqnzOgRWsBQWiOZNeR7UvVuCv4HLUuZM0liKTb2FMwgIN991JKLDUTuWY1x8IMHLRdakGzS', images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD82RtNeC6UIQ7eV7VhnKG6fbIF290wz0vEhN4vpeoFwgilwMcAtdGN-FBoDFY_fIwHtP4lN1eCyafLvH5Z2oWwl3x9o4Zl0cH15srw1c9ZCQQKZP9oqjB4NyvnkRdwuwVFv-rPHZAJbOG5tnRFiNDIZA5qq9CLN2MPUJxEaLpGlb3VlUvRYxOm61M3dAztUR4ELE5Aae6nswf0eix8qbIbwPeHsL38GogmaVLtvCTSRvT_wjxb9VmeNzj91XQpt0ogxg0WWoIzArsp', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_OYhVvyQSsbCQ4iHmmL5Xw0oYTLovxwHlMsTPxuuv9xGj2N-Lk5-W5C0X6MXlQUtPtbF9H7PXicjKEPr-KyN4kmHDrtYI0Xottda9hrBY3PEm_IXplI8VfUkXGnDrm5zk5NK6wOgnw0Tz29VeDjeZ8cmCjS6WYMM-DOH_XQnQ77lXC5BT2g6CCSoz6UhxjILgabC3ublJOOJJrkIT4-xQi19vALmqs0-WHfHjpQVfOe8QDk7-vFbnxaFvJxKCOTr6q4ON3lM9yOUp', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-a1GfhArV_6OIT-eU77u4aK2EmaD7_JXRXLU4Fy4ICqeAxbfFmJoFoZXKiHivg12PjhsZzhflKOIIiLrsP28gBFIvePI0--9F4HGdmEoKWs_CeshcN02dhH7gScnQFgqUDiAe4pGfGQFhsgW3k8Jr_cJ7WD1mzC_QtpcQLU9VEUmnbhYgorZQJkG1iIEZwcQ4jKc3a713dgu5-vYpBdQP8Jyn4oYBgp_D9Nbl-MlvD7YBooXEFPNqsdPV_nTOolu58XqbVt1fbOT'] },
];

export default function VerificationQueue({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const handleApprove = () => {
    setSelectedVendor(null);
    showToast('Đã cấp huy hiệu xác thực cho vendor', 'success');
  };

  const handleReject = () => {
    setSelectedVendor(null);
    showToast('Đã từ chối hồ sơ vendor', 'error');
  };

  const tabs = [
    { id: 'pending', label: 'Đang Chờ', count: 2 },
    { id: 'approved', label: 'Đã Duyệt', count: 15 },
    { id: 'rejected', label: 'Từ Chối', count: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Duyệt Hồ Sơ Vendor</h2>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockVendors.map(vendor => (
          <div key={vendor.id} className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-start gap-4 mb-6">
              <img src={vendor.logo} alt={vendor.name} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{vendor.name}</h3>
                <p className="text-sm text-slate-400">Ngày nộp: {vendor.date}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Chờ duyệt
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Preview Portfolio</h4>
              <div className="grid grid-cols-3 gap-2">
                {vendor.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Portfolio ${idx}`} className="w-full aspect-square object-cover rounded-lg border border-white/5" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 text-sm">
              <FileText className="w-4 h-4 text-primary" />
              <a href="#" className="text-primary hover:underline">Giấy phép kinh doanh (PDF)</a>
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
              <button 
                onClick={() => setSelectedVendor(vendor)}
                className="flex-1 py-2 glass-card text-white font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" /> Xem Hồ Sơ Đầy Đủ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedVendor && (
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
              className="glass-card rounded-2xl w-full max-w-3xl bg-background-dark overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold text-white">Chi Tiết Hồ Sơ: {selectedVendor.name}</h2>
                <button onClick={() => setSelectedVendor(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                {/* Vendor details mock */}
                <div className="flex items-start gap-6">
                  <img src={selectedVendor.logo} alt={selectedVendor.name} className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                  <div>
                    <h3 className="text-2xl font-serif text-white mb-2">{selectedVendor.name}</h3>
                    <p className="text-slate-400 mb-4">Chuyên gia trong lĩnh vực thiết kế và thi công sự kiện cao cấp. Với hơn 5 năm kinh nghiệm...</p>
                    <div className="flex gap-4 text-sm text-slate-300">
                      <span>MST: 0312345678</span>
                      <span>SĐT: 0901234567</span>
                      <span>Email: contact@lumina.vn</span>
                    </div>
                  </div>
                </div>
                
                {/* Portfolio mock */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Portfolio</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedVendor.images.map((img: string, idx: number) => (
                      <img key={idx} src={img} alt={`Portfolio ${idx}`} className="w-full aspect-[4/3] object-cover rounded-lg border border-white/5" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-background-dark sticky bottom-0 flex gap-4">
                <button 
                  onClick={handleReject} 
                  className="flex-1 py-3 glass-card text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> Từ Chối
                </button>
                <button 
                  onClick={handleApprove} 
                  className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all cyan-glow flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" /> Cấp Huy Hiệu ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
