import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Eye, FileText, ShieldCheck, X, Loader, AlertCircle } from 'lucide-react';
import { getPendingVendors, approveVendor, rejectVendor } from '../../services/adminApi';

interface Vendor {
  _id: string;
  companyName: string;
  email: string;
  avatar?: string;
  businessLicense: string[];
  businessLicenseNames?: string[];
  companyAddress: string;
  phone: string;
  taxId: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationReason?: string;
  createdAt: string;
  userId?: {
    name: string;
  };
}

const renderBusinessLicenseLinks = (license: string | string[] | undefined, names?: string[] | undefined) => {
  if (!license || (Array.isArray(license) && license.length === 0)) {
    return null;
  }

  const links = Array.isArray(license) ? license : [license];

  return (
    <div className="space-y-2">
      {links.map((item, index) => (
        <a
          key={`${item}-${index}`}
          href={item}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>{names?.[index] || (links.length > 1 ? `Giấy phép ${index + 1}` : 'Giấy phép kinh doanh')}</span>
        </a>
      ))}
    </div>
  );
};

export default function VerificationQueue({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadVendors();
  }, [activeTab]);

  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPendingVendors(activeTab, 1, 50);
      setVendors(response.data || []);
      
      // Update counts
      const pending = await getPendingVendors('pending', 1, 1);
      const approved = await getPendingVendors('approved', 1, 1);
      const rejected = await getPendingVendors('rejected', 1, 1);
      
      setCounts({
        pending: pending.pagination?.total || 0,
        approved: approved.pagination?.total || 0,
        rejected: rejected.pagination?.total || 0
      });
    } catch (err) {
      setError('Lỗi tải danh sách vendor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVendor) return;
    
    setIsProcessing(true);
    try {
      await approveVendor(selectedVendor._id);
      showToast('Đã phê duyệt vendor thành công', 'success');
      setSelectedVendor(null);
      await loadVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi phê duyệt vendor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVendor || !rejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'error');
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectVendor(selectedVendor._id, rejectionReason);
      showToast('Đã từ chối hồ sơ vendor', 'success');
      setSelectedVendor(null);
      setRejectionReason('');
      await loadVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi từ chối vendor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Đang Chờ', count: counts.pending },
    { id: 'approved', label: 'Đã Duyệt', count: counts.approved },
    { id: 'rejected', label: 'Từ Chối', count: counts.rejected },
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

      {error && (
        <div className="glass-card p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-slate-400">Đang tải danh sách vendor...</p>
          </div>
        </div>
      ) : vendors.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <p className="text-slate-400">Không có vendor nào ở trạng thái này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map(vendor => (
            <div key={vendor._id} className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <img src={vendor.avatar || 'https://via.placeholder.com/64'} alt={vendor.companyName} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{vendor.companyName}</h3>
                  <p className="text-sm text-slate-400">Ngày nộp: {new Date(vendor.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  vendor.verificationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  vendor.verificationStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {vendor.verificationStatus === 'pending' ? 'Chờ duyệt' :
                   vendor.verificationStatus === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Thông tin công ty</h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>MST: {vendor.taxId}</p>
                  <p>Địa chỉ: {vendor.companyAddress}</p>
                  <p>SĐT: {vendor.phone}</p>
                  <p>Email: {vendor.email}</p>
                </div>
              </div>

              {renderBusinessLicenseLinks(vendor.businessLicense, vendor.businessLicenseNames)}

              {vendor.verificationStatus === 'rejected' && vendor.verificationReason && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-300">
                  <p className="font-semibold mb-1">Lý do từ chối:</p>
                  <p>{vendor.verificationReason}</p>
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setSelectedVendor(vendor)}
                    className="flex-1 py-2 glass-card text-white font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" /> Xem Hồ Sơ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
                <h2 className="text-xl font-bold text-white">Chi Tiết Hồ Sơ: {selectedVendor.companyName}</h2>
                <button onClick={() => setSelectedVendor(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors" disabled={isProcessing}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                <div className="flex items-start gap-6">
                  <img src={selectedVendor.avatar || 'https://via.placeholder.com/96'} alt={selectedVendor.companyName} className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedVendor.companyName}</h3>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>MST: {selectedVendor.taxId}</p>
                      <p>SĐT: {selectedVendor.phone}</p>
                      <p>Email: {selectedVendor.email}</p>
                      <p>Địa chỉ: {selectedVendor.companyAddress}</p>
                    </div>
                  </div>
                </div>
                
                {renderBusinessLicenseLinks(selectedVendor.businessLicense, selectedVendor.businessLicenseNames)}
                
              </div>

              {selectedVendor.verificationStatus === 'pending' && (
                <div className="p-6 border-t border-white/10 bg-background-dark sticky bottom-0 space-y-4">
                  <textarea
                    placeholder="Nhập lý do từ chối (nếu cần)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex-1 py-3 glass-card text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Từ Chối
                    </button>
                    <button 
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      Cấp Huy Hiệu ✓
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
