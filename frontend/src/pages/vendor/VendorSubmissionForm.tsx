import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { uploadToCloudinary, uploadToCloudinaryFile, optimizeCloudinaryUrl } from '../../services/cloudinary';
import api from '../../services/api';

interface VendorStatus {
  verificationStatus: 'pending' | 'approved' | 'rejected';
  companyName?: string;
  taxId?: string;
  verificationReason?: string;
}

interface LicenseFileItem {
  name: string;
  url: string;
}

const LICENSE_MAX_SIZE = 20 * 1024 * 1024;

const extractFileName = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split('/').pop() || '';
    return decodeURIComponent(fileName) || 'Tài liệu';
  } catch {
    return 'Tài liệu';
  }
};

export function VendorSubmissionForm() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    companyAddress: '',
    phone: user?.phone || '',
    email: user?.email || '',
    website: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    bio: '',
    businessLicense: [] as string[],
    businessLicenseNames: [] as string[],
    avatar: ''
  });

  const [licenseFiles, setLicenseFiles] = useState<LicenseFileItem[]>([]);

  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [licenseUploadError, setLicenseUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load current vendor status
  useEffect(() => {
    const loadVendorStatus = async () => {
      try {
        const response = await api.get('/vendor/registration/info');
        if (response.data?.vendor) {
          const vendor = response.data.vendor;
          setVendorStatus({
            verificationStatus: vendor.verificationStatus,
            companyName: vendor.companyName,
            taxId: vendor.taxId,
            verificationReason: vendor.verificationReason
          });
          // Pre-fill form with existing data
            if (vendor.companyName) {
            const bizLicense = Array.isArray(vendor.businessLicense)
              ? vendor.businessLicense
              : vendor.businessLicense
                ? [vendor.businessLicense]
                : [];
            let bizLicenseNames = Array.isArray(vendor.businessLicenseNames)
              ? vendor.businessLicenseNames
              : [];
            if (bizLicenseNames.length > bizLicense.length) {
              bizLicenseNames = bizLicenseNames.slice(0, bizLicense.length);
            }

            setFormData(prev => ({
              ...prev,
              companyName: vendor.companyName,
              taxId: vendor.taxId,
              companyAddress: vendor.companyAddress,
              phone: vendor.phone || prev.phone,
              email: vendor.email || prev.email,
              website: vendor.website || '',
                accountHolderName: vendor.accountHolderName || '',
                accountNumber: vendor.accountNumber || '',
                bankName: vendor.bankName || '',
                bio: vendor.bio || '',
              businessLicense: bizLicense,
              businessLicenseNames: bizLicenseNames,
              avatar: vendor.avatar || ''
            }));

            setLicenseFiles(
              bizLicense.map((url, index) => ({
                name: bizLicenseNames[index] || extractFileName(url),
                url,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error loading vendor status:', err);
      } finally {
        setLoadingStatus(false);
      }
    };

    if (user?.role === 'vendor') {
      loadVendorStatus();
    }
  }, [user]);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-navy py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg">Chỉ vendor mới có thể truy cập trang này</p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-6 px-6 py-2 bg-cyan text-navy rounded-lg hover:bg-cyan/80 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-cyan/30 border-t-cyan animate-spin mx-auto mb-4"></div>
          <p className="text-silver/60">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAvatarUploadError(null);

    try {
      const uploaded = await uploadToCloudinary(file, 'eventflow/vendor-avatars');
      const optimized = optimizeCloudinaryUrl(uploaded.secure_url, 300, 300, 85);
      setFormData(prev => ({ ...prev, avatar: optimized }));
    } catch (err) {
      setAvatarUploadError(err instanceof Error ? err.message : 'Lỗi tải lên ảnh đại diện');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setLicenseUploadError(null);

    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const res = await uploadToCloudinaryFile(file, 'eventflow/vendor-licenses', undefined, 20 * 1024 * 1024);

          const url = !file.type.startsWith('image/')
            ? res.secure_url.replace('/upload/', '/upload/fl_attachment/')
            : res.secure_url;

          return {
            name: file.name,
            url,
          };
        })
      );

      setFormData(prev => ({
        ...prev,
        businessLicense: [...prev.businessLicense, ...uploadedFiles.map(file => file.url)],
        businessLicenseNames: [...prev.businessLicenseNames, ...uploadedFiles.map(file => file.name)]
      }));
      setLicenseFiles(prev => [...prev, ...uploadedFiles]);
      e.target.value = '';
    } catch (err) {
      setLicenseUploadError(err instanceof Error ? err.message : 'Lỗi tải lên giấy phép');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    // Validate required fields (businessLicense is optional for testing)
    const localErrors: Partial<Record<string, string>> = {};
    if (!formData.companyName || !formData.companyName.trim()) localErrors.companyName = 'Tên công ty là bắt buộc.';
    if (!formData.taxId || !formData.taxId.trim()) localErrors.taxId = 'Mã số thuế là bắt buộc.';
    if (!formData.companyAddress || !formData.companyAddress.trim()) localErrors.companyAddress = 'Địa chỉ công ty là bắt buộc.';
    if (!formData.accountHolderName || !(formData as any).accountHolderName.trim()) localErrors.accountHolderName = 'Tên chủ tài khoản là bắt buộc.';
    if (!formData.accountNumber || !(formData as any).accountNumber.trim()) localErrors.accountNumber = 'Số tài khoản là bắt buộc.';
    if (!formData.bankName || !(formData as any).bankName.trim()) localErrors.bankName = 'Tên ngân hàng là bắt buộc.';

    // Phone validation (10 digits)
    if (!formData.phone || !formData.phone.trim()) {
      localErrors.phone = 'Số điện thoại là bắt buộc.';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 10) localErrors.phone = 'Số điện thoại phải gồm 10 chữ số.';
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      localErrors.email = 'Email là bắt buộc.';
    } else {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(String(formData.email).toLowerCase())) localErrors.email = 'Email không hợp lệ.';
    }

    if (Object.keys(localErrors).length > 0) {
      setFormErrors(localErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/vendor/submit-info', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/vendor/registration');
      }, 2000);
    } catch (err: any) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setFormErrors(resp.errors);
      }
      setError(resp?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-navy py-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-8 rounded-2xl text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Gửi thành công!</h2>
          <p className="text-silver/60 mb-6">Chúng tôi sẽ xem xét thông tin của bạn trong 2-3 ngày làm việc</p>
          <p className="text-silver/40 text-sm">Đang chuyển hướng...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-4xl text-white mb-2">
                {isViewMode ? 'Thông Tin Doanh Nghiệp' : 'Hoàn Thành Hồ Sơ Doanh Nghiệp'}
              </h1>
              <p className="text-silver/60">
                {isViewMode ? 'Xem thông tin doanh nghiệp của bạn' : 'Cung cấp thông tin doanh nghiệp của bạn để chúng tôi xem xét và phê duyệt'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/vendor/registration')}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gradient-to-r from-cyan to-cyan/70 text-navy"
            >
              ← Quay Lại
            </button>
          </div>

          {/* Status Indicator */}
          {vendorStatus && vendorStatus.verificationStatus !== 'rejected' && (
            <div className={`glass-panel p-6 rounded-2xl border-l-4 ${
              vendorStatus.verificationStatus === 'pending' 
                ? 'border-l-yellow-400 bg-yellow-500/5' 
                : 'border-l-emerald-400 bg-emerald-500/5'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {vendorStatus.verificationStatus === 'pending' ? (
                  <Clock className="w-5 h-5 text-yellow-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                <p className="text-white font-semibold">
                  {vendorStatus.verificationStatus === 'pending' ? 'Đơn Đang Xét Duyệt' : 'Đã Được Phê Duyệt'}
                </p>
              </div>
              {vendorStatus.verificationStatus === 'pending' ? (
                <p className="text-yellow-300 text-sm">
                  Hồ sơ doanh nghiệp "{vendorStatus.companyName}" của bạn đang được xem xét. Bạn vẫn có thể cập nhật thông tin nếu cần thiết.
                </p>
              ) : (
                <p className="text-emerald-300 text-sm">
                  Hồ sơ doanh nghiệp của bạn đã được phê duyệt thành công! Bạn có thể cập nhật thông tin bất cứ lúc nào.
                </p>
              )}
            </div>
          )}

          {/* Rejection Notice */}
          {vendorStatus?.verificationStatus === 'rejected' && (
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-400 bg-red-500/5">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="text-white font-semibold">Đơn Bị Từ Chối</p>
              </div>
              <p className="text-red-300 text-sm mb-3">
                Lý do: {vendorStatus.verificationReason || 'Vui lòng liên hệ admin để biết chi tiết'}
              </p>
              <p className="text-red-200 text-sm">
                Bạn có thể gửi lại hồ sơ sau khi cập nhật thông tin.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo */}
            <div className="glass-panel p-6 rounded-2xl">
              <label className="block text-white font-semibold mb-4">Logo Doanh Nghiệp (Tùy chọn)</label>
              <div
                className={`border-2 border-dashed border-cyan/30 rounded-lg p-6 text-center ${isViewMode ? '' : 'cursor-pointer hover:border-cyan/60'} transition-colors`}
                onClick={() => { if (!isViewMode) fileInputRef.current?.click(); }}
              >
                {formData.avatar ? (
                  <div className="flex flex-col items-center">
                    <img src={formData.avatar} alt="Preview" className="w-24 h-24 rounded-lg mb-4 object-cover" />
                    {!isViewMode && <p className="text-cyan text-sm">Nhấn để thay đổi</p>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-cyan/60 mb-2" />
                    <p className="text-white font-semibold">Tải lên logo</p>
                    <p className="text-silver/60 text-sm">JPG, PNG hoặc WebP - Tối đa 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                disabled={isUploading || isViewMode}
                className="hidden"
              />
              {avatarUploadError && <p className="text-red-400 text-sm mt-2">{avatarUploadError}</p>}
            </div>

            {/* Company Info */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <label className="block">
                <span className="text-white font-semibold block mb-2">Tên Công Ty *</span>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="VD: ABC Event Company"
                />
                {formErrors.companyName && <p className="text-red-400 text-sm mt-2">{formErrors.companyName}</p>}
              </label>

              <label className="block">
                <span className="text-white font-semibold block mb-2">Mã Số Thuế *</span>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="VD: 0123456789"
                />
                {formErrors.taxId && <p className="text-red-400 text-sm mt-2">{formErrors.taxId}</p>}
              </label>

              <label className="block">
                <span className="text-white font-semibold block mb-2">Địa Chỉ Công Ty *</span>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="VD: 123 Đường ABC, Quận 1, TP HCM"
                />
                {formErrors.companyAddress && <p className="text-red-400 text-sm mt-2">{formErrors.companyAddress}</p>}
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white font-semibold block mb-2">Điện Thoại</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  {formErrors.phone && <p className="text-red-400 text-sm mt-2">{formErrors.phone}</p>}
                </label>

                <label className="block">
                  <span className="text-white font-semibold block mb-2">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  {formErrors.email && <p className="text-red-400 text-sm mt-2">{formErrors.email}</p>}
                </label>
              </div>

              <label className="block">
                <span className="text-white font-semibold block mb-2">Website (Tùy chọn)</span>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="https://example.com"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white font-semibold block mb-2">Tên Chủ Tài Khoản (Ngân Hàng)</span>
                <input
                      type="text"
                      name="accountHolderName"
                      value={(formData as any).accountHolderName || ''}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="VD: CÔNG TY TNHH ABC"
                    />
                  {formErrors.accountHolderName && <p className="text-red-400 text-sm mt-2">{formErrors.accountHolderName}</p>}
                </label>

                <label className="block">
                  <span className="text-white font-semibold block mb-2">Số Tài Khoản</span>
                <input
                      type="text"
                      name="accountNumber"
                      value={(formData as any).accountNumber || ''}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="VD: 1029384756"
                    />
                  {formErrors.accountNumber && <p className="text-red-400 text-sm mt-2">{formErrors.accountNumber}</p>}
                </label>

                <label className="block">
                  <span className="text-white font-semibold block mb-2">Tên Ngân Hàng</span>
                <input
                      type="text"
                      name="bankName"
                      value={(formData as any).bankName || ''}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="VD: Vietcombank"
                    />
                  {formErrors.bankName && <p className="text-red-400 text-sm mt-2">{formErrors.bankName}</p>}
                </label>
              </div>
            </div>

            {/* Business License */}
            <div className="glass-panel p-6 rounded-2xl">
              <label className="block text-white font-semibold mb-4">Giấy Phép Kinh Doanh *</label>
              <p className="text-silver/60 text-sm mb-3">
                Hỗ trợ PDF, JPG, PNG, WEBP và có thể tải nhiều tệp cùng lúc, tối đa 20MB/tệp.
              </p>
              <div
                className={`border-2 border-dashed border-cyan/30 rounded-lg p-6 text-center ${isViewMode ? '' : 'cursor-pointer hover:border-cyan/60'} transition-colors`}
                onClick={() => { if (!isViewMode) licenseInputRef.current?.click(); }}
              >
                {licenseFiles.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mb-2" />
                    <p className="text-white font-semibold">Đã tải lên {licenseFiles.length} tệp</p>
                    <p className="text-cyan text-sm">Nhấn để chọn thêm hoặc thay đổi</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-cyan/60 mb-2" />
                    <p className="text-white font-semibold">Tải lên giấy phép</p>
                    <p className="text-silver/60 text-sm">JPG, PNG, WEBP hoặc PDF - Tối đa 20MB/tệp</p>
                  </div>
                )}
              </div>
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
                multiple
                onChange={handleLicenseUpload}
                disabled={isUploading || isViewMode}
                className="hidden"
              />
              {licenseFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {licenseFiles.map((file, index) => (
                    <div key={`${file.url}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <a href={(() => {
                          const u = file.url;
                          if (!u.includes('cloudinary.com') || !/\.(pdf|docx?|xlsx?|pptx?|zip|rar)$/i.test(u)) return u;
                          if (u.includes('raw/upload')) return u.replace('raw/upload', 'image/upload/fl_attachment');
                          return u.includes('fl_attachment') ? u : u.replace('/upload/', '/upload/fl_attachment/');
                        })()} target="_blank" rel="noreferrer" className="text-cyan text-xs hover:underline">
                          Xem tài liệu
                        </a>
                      </div>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setLicenseFiles(prev => prev.filter((_, currentIndex) => currentIndex !== index));
                            setFormData(prev => {
                              const urlIndex = prev.businessLicense.indexOf(file.url);
                              if (urlIndex === -1) return prev;
                              return {
                                ...prev,
                                businessLicense: prev.businessLicense.filter((_, i) => i !== urlIndex),
                                businessLicenseNames: prev.businessLicenseNames.filter((_, i) => i !== urlIndex),
                              };
                            });
                          }}
                          className="text-silver/60 hover:text-white transition-colors"
                          aria-label={`Xóa file ${file.name}`}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {licenseUploadError && <p className="text-red-400 text-sm mt-3">{licenseUploadError}</p>}
            </div>

            {/* Description */}
            <div className="glass-panel p-6 rounded-2xl">
              <label className="block">
                <span className="text-white font-semibold block mb-2">Mô Tả Doanh Nghiệp (Tùy chọn)</span>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  rows={4}
                  className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Mô tả về doanh nghiệp, kinh nghiệm, chuyên môn..."
                />
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-panel p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </p>
              </div>
            )}

            {!isViewMode && (
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isSubmitting || isUploading
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30'
                    : 'bg-gradient-to-r from-cyan to-cyan/70 text-navy hover:shadow-lg hover:shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : vendorStatus?.verificationStatus === 'pending' ? (
                  'Cập Nhật Thông Tin'
                ) : vendorStatus?.verificationStatus === 'rejected' ? (
                  'Gửi Lại Hồ Sơ'
                ) : (
                  'Gửi Thông Tin Doanh Nghiệp'
                )}
              </button>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
