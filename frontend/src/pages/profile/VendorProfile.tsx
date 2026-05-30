import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Mail, Edit2, Check, X, Plus, Trash2, GripHorizontal, Upload, Loader } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { FileUpload } from '../../components/ui/FileUpload';
import { uploadToCloudinary, optimizeCloudinaryUrl } from '../../services/cloudinary';

interface EditableFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onSave: (value: string) => void;
  multiline?: boolean;
}

function EditableField({ label, value, icon, onSave, multiline }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      // Support async onSave; wait for validation/api and only close on success
      await onSave(editValue);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lưu thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel px-6 py-4 rounded-xl flex items-start justify-between group hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-4 flex-1">
        {icon && <div className="text-cyan/60 mt-1">{icon}</div>}
        <div className="flex-1">
          <p className="text-silver/60 text-sm">{label}</p>
          {isEditing ? (
            multiline ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-white/5 text-white px-2 py-1 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan w-full mt-1 resize-none h-20"
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-white/5 text-white px-2 py-1 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan w-full mt-1"
              />
            )
          ) : (
            <p className="text-white font-medium whitespace-pre-wrap">{value || 'Chưa cập nhật'}</p>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2 ml-4 items-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
            disabled={isSaving}
            className="text-red-400 hover:text-red-300 transition-colors p-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
          {errorMsg && <p className="text-sm text-red-400 ml-2">{errorMsg}</p>}
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-cyan/60 group-hover:text-cyan transition-colors p-2 opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function VendorProfile({ showToast }: { showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const { user, updateProfile, setUser } = useAuthStore();
  const [portfolio, setPortfolio] = useState<string[]>(user?.portfolio || []);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  if (!user) {
    return <div>Chưa đăng nhập</div>;
  }

  const handleSaveField = async (field: string, value: string) => {
    await updateProfile({ [field]: value });
  };

  // wrap updateProfile to show toast feedback
  const handleSaveProfileField = async (field: string, value: string) => {
    try {
      await updateProfile({ [field]: value });
      showToast?.('Cập nhật thành công', 'success');
    } catch (err: any) {
      showToast?.(err?.response?.data?.message || 'Lỗi khi cập nhật', 'error');
      throw err;
    }
  };

  const handleSaveVendorBio = async (value: string) => {
    // Client-side validation: ensure required fields are present before sending
    const companyName = vendor?.companyName || user.companyName || '';
    const taxId = vendor?.taxId || user.taxId || '';
    const companyAddress = vendor?.companyAddress || user.companyAddress || '';

    if (!companyName.trim() || !taxId.trim() || !companyAddress.trim()) {
      const msg = 'Vui lòng cung cấp Tên công ty, Mã số thuế và Địa chỉ trước khi cập nhật mô tả.';
      showToast?.(msg, 'error');
      throw new Error(msg);
    }

    try {
      const payload = {
        companyName: companyName.trim(),
        taxId: taxId.trim(),
        companyAddress: companyAddress.trim(),
        businessLicense: vendor?.businessLicense || '',
        phone: vendor?.phone || user.phone || '',
        email: vendor?.email || user.email || '',
        website: vendor?.website || '',
        bio: value,
        avatar: vendor?.avatar || user.avatar || ''
      };

      const res = await api.post('/vendor/submit-info', payload);
      // refresh vendor state
      const refreshed = await api.get('/vendor/info');
      setVendor(refreshed.data.vendor);
      showToast?.('Cập nhật mô tả doanh nghiệp thành công', 'success');

      // If backend returned updated user info (unlikely), update local store
      if (res.data?.vendor && res.data.vendor.userId) {
        // no-op for now; user store doesn't keep vendor-level fields
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật mô tả vendor:', err?.response?.data || err);
      showToast?.(err?.response?.data?.message || 'Lỗi khi cập nhật mô tả', 'error');
      throw err;
    }
  };

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSaveVendorField = async (field: string, value: string) => {
    // If updating phone or email, delegate to profile update
    if (field === 'phone') {
      if (!validatePhone(value)) {
        const msg = 'Số điện thoại phải gồm 10 chữ số.';
        showToast?.(msg, 'error');
        throw new Error(msg);
      }
      await handleSaveProfileField('phone', value);
      // also sync phone into vendor document so vendor.phone matches user.phone
      try {
        const payload = {
          companyName: vendor?.companyName || user.companyName || '',
          taxId: vendor?.taxId || user.taxId || '',
          companyAddress: vendor?.companyAddress || user.companyAddress || '',
          businessLicense: vendor?.businessLicense || '',
          phone: value,
          email: vendor?.email || user.email || '',
          website: vendor?.website || '',
          bio: vendor?.bio || '',
          avatar: vendor?.avatar || user.avatar || ''
        };
        await api.post('/vendor/submit-info', payload);
      } catch (err) {
        // non-fatal: log and continue to refresh
        console.error('Failed to sync phone to vendor:', err);
      }
      // refresh vendor info
      const refreshed = await api.get('/vendor/info').catch(() => null);
      if (refreshed?.data?.vendor) setVendor(refreshed.data.vendor);
      return;
    }

    if (field === 'email') {
      if (!validateEmail(value)) {
        const msg = 'Email không hợp lệ.';
        showToast?.(msg, 'error');
        throw new Error(msg);
      }
      await handleSaveProfileField('email', value);
      // sync email to vendor record as well
      try {
        const payload = {
          companyName: vendor?.companyName || user.companyName || '',
          taxId: vendor?.taxId || user.taxId || '',
          companyAddress: vendor?.companyAddress || user.companyAddress || '',
          businessLicense: vendor?.businessLicense || '',
          phone: vendor?.phone || user.phone || '',
          email: value,
          website: vendor?.website || '',
          bio: vendor?.bio || '',
          avatar: vendor?.avatar || user.avatar || ''
        };
        await api.post('/vendor/submit-info', payload);
      } catch (err) {
        console.error('Failed to sync email to vendor:', err);
      }
      const refreshed = await api.get('/vendor/info').catch(() => null);
      if (refreshed?.data?.vendor) setVendor(refreshed.data.vendor);
      return;
    }

    // For vendor-level fields (companyAddress, website), ensure required vendor identity fields exist
    const companyName = vendor?.companyName || user.companyName || '';
    const taxId = vendor?.taxId || user.taxId || '';
    const companyAddress = field === 'companyAddress' ? value : (vendor?.companyAddress || user.companyAddress || '');

    if (!companyName.trim() || !taxId.trim() || !companyAddress.trim()) {
      const msg = 'Vui lòng đảm bảo Tên công ty, Mã số thuế và Địa chỉ đã được điền trước khi cập nhật.';
      showToast?.(msg, 'error');
      throw new Error(msg);
    }

    try {
      const payload: any = {
        companyName: companyName.trim(),
        taxId: taxId.trim(),
        companyAddress: companyAddress.trim(),
        businessLicense: vendor?.businessLicense || '',
        phone: vendor?.phone || user.phone || '',
        email: vendor?.email || user.email || '',
        website: vendor?.website || '',
        bio: vendor?.bio || '' ,
        avatar: vendor?.avatar || user.avatar || ''
      };

      payload[field] = value;

      const res = await api.post('/vendor/submit-info', payload);
      const refreshed = await api.get('/vendor/info');
      setVendor(refreshed.data.vendor);
      showToast?.('Cập nhật thành công', 'success');
      return res;
    } catch (err: any) {
      showToast?.(err?.response?.data?.message || 'Lỗi khi cập nhật', 'error');
      throw err;
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setAvatarError(null);

    try {
      const uploadedImage = await uploadToCloudinary(file, 'eventflow/vendor-avatars');
      const optimizedUrl = optimizeCloudinaryUrl(uploadedImage.secure_url, 200, 200, 85);
      await updateProfile({ avatar: optimizedUrl });
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Lỗi tải lên avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePortfolioUpload = (files: File[]) => {
    // In real app, upload files and get URLs
    console.log('Portfolio files:', files);
  };

  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await api.get('/vendor/info');
        setVendor(res.data.vendor);
      } catch (err) {
        // silently ignore; vendor may not exist yet
        setVendor(null);
      }
    };

    if (user?.role === 'vendor') fetchVendor();
  }, [user]);

  const tabs: TabItem[] = [
    {
      id: 'business',
      label: 'Thông tin doanh nghiệp',
      content: (
        <div className="space-y-4">
          {/* Business info is read-only and sourced from the approved vendor collection when available */}
          <div className="glass-panel px-6 py-4 rounded-xl">
            <p className="text-silver/60 text-sm">Tên công ty</p>
            <p className="text-white font-medium mt-1">{vendor?.companyName || user.companyName || 'Chưa cập nhật'}</p>
          </div>

          <div className="glass-panel px-6 py-4 rounded-xl">
            <p className="text-silver/60 text-sm">Mã số thuế</p>
            <p className="text-white font-medium mt-1">{vendor?.taxId || user.taxId || 'Chưa cập nhật'}</p>
          </div>

          <EditableField
            label="Địa chỉ"
            value={vendor?.companyAddress || user.companyAddress || ''}
            onSave={(val) => handleSaveVendorField('companyAddress', val)}
            icon={<MapPin className="w-5 h-5" />}
          />

          <EditableField
            label="Số điện thoại"
            value={vendor?.phone || user.phone || ''}
            onSave={(val) => handleSaveVendorField('phone', val)}
            icon={<Phone className="w-5 h-5" />}
          />

          <EditableField
            label="Email liên hệ"
            value={vendor?.email || user.email || ''}
            onSave={(val) => handleSaveVendorField('email', val)}
            icon={<Mail className="w-5 h-5" />}
          />

          <EditableField
            label="Website"
            value={vendor?.website || ''}
            onSave={(val) => handleSaveVendorField('website', val)}
            icon={<MapPin className="w-5 h-5" />}
          />

          <EditableField
            label="Mô tả doanh nghiệp"
            value={vendor?.bio || user.bio || ''}
            multiline
            onSave={(val) => handleSaveVendorBio(val)}
          />

          <div className="glass-panel px-6 py-4 rounded-xl">
            <label className="text-silver text-sm font-medium">Loại sự kiện</label>
            <div className="flex gap-4 mt-3">
              {['Corporate', 'Birthday', 'Wedding'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 accent-cyan" checked={false} readOnly />
                  <span className="text-white">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: (
        <div className="space-y-6">
          {portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <img
                    src={img}
                    alt={`Portfolio ${i + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                    <button className="p-2 bg-cyan/20 hover:bg-cyan/30 rounded transition-colors">
                      <GripHorizontal className="w-4 h-4 text-cyan" />
                    </button>
                    <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-panel px-6 py-8 rounded-xl text-center">
              <p className="text-silver/60 mb-4">Chưa có ảnh portfolio</p>
            </div>
          )}

          <div className="glass-panel p-6 rounded-xl">
            <label className="text-silver text-sm font-medium mb-3 block">Thêm ảnh Portfolio</label>
            <FileUpload
              onFilesSelected={handlePortfolioUpload}
              multiple
              accept="image/*"
              maxFiles={20}
              preview
            />
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <label className="text-silver text-sm font-medium mb-3 block">Upload file 3D/360</label>
            <FileUpload
              onFilesSelected={(files) => console.log('3D files:', files)}
              accept=".glb,.gltf,.obj"
              maxFiles={1}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'reviews',
      label: 'Đánh giá & Nhận xét',
      content: (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-4xl font-bold text-white">4.8</div>
                  <div className="text-cyan flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-cyan" />
                    ))}
                  </div>
                </div>
                <p className="text-silver/60 text-sm mt-1">256 đánh giá</p>
              </div>
            </div>

            {/* Rating Bars */}
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center gap-3 mb-3">
                <span className="text-silver/60 text-sm w-4">{stars}★</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(6 - Math.abs(stars - 3)) * 15}%` }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-cyan to-cyan/50"
                  />
                </div>
                <span className="text-silver/40 text-xs w-8 text-right">
                  {Math.floor((6 - Math.abs(stars - 3)) * 10)}%
                </span>
              </div>
            ))}
          </div>

          <div className="glass-panel px-6 py-8 rounded-xl text-center">
            <p className="text-silver/60">Chưa có đánh giá nào</p>
          </div>
        </div>
      ),
    },
    {
      id: 'stats',
      label: 'Thống kê',
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Tổng Booking', value: '0', icon: '📅' },
              { label: 'Tỷ lệ hoàn thành', value: '100%', icon: '✅' },
              { label: 'Thời phản hồi', value: '< 1 giờ', icon: '⏱️' },
              { label: 'Doanh thu tháng này', value: '₫ 0', icon: '💰' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 rounded-xl"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-silver/60 text-sm">{stat.label}</p>
                <p className="text-white font-bold text-2xl mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="font-display text-4xl text-white mb-2">Hồ Sơ Doanh Nghiệp</h1>
            <p className="text-silver/60">Quản lý thông tin công ty và dịch vụ</p>
          </div>

          {/* Profile Grid */}
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
            {/* Left Column - Company Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-2xl"
            >
              <div className="mb-4 relative inline-block mx-auto">
                <Avatar
                  src={user.avatar}
                  alt={user.companyName}
                  size="xl"
                  ring
                  className="mx-auto"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className={clsx(
                    'absolute bottom-0 right-0 bg-cyan text-navy p-2 rounded-full',
                    'hover:bg-cyan/80 transition-all shadow-lg',
                    isUploadingAvatar && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isUploadingAvatar ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-semibold">
                  Đang hoạt động
                </div>
              </div>
              {avatarError && (
                <p className="text-red-400 text-sm mb-2 text-center">{avatarError}</p>
              )}
              <h2 className="font-display text-2xl text-white mb-2 text-center">{user.companyName}</h2>
              <div className="flex justify-center items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan text-cyan" />
                ))}
                <span className="text-silver/60 text-xs ml-2">(256 đánh giá)</span>
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className={clsx(
                  'w-full py-2 rounded-lg bg-gradient-to-r from-cyan to-cyan/70 text-navy font-semibold hover:shadow-lg hover:shadow-cyan/30 transition-all',
                  isUploadingAvatar && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isUploadingAvatar ? 'Đang tải...' : 'Chỉnh sửa ảnh'}
              </button>
            </motion.div>

            {/* Right Column - Tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-2xl"
            >
              <Tabs tabs={tabs} defaultTab="business" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
