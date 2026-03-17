import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Mail, Edit2, Check, X, Plus, Trash2, GripHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { FileUpload } from '../../components/ui/FileUpload';

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

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
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
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleSave}
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-2 flex-shrink-0"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
            className="text-red-400 hover:text-red-300 transition-colors p-2 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
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

export function VendorProfile() {
  const { user, updateProfile } = useAuthStore();
  const [portfolio, setPortfolio] = useState<string[]>(user?.portfolio || []);

  if (!user) {
    return <div>Chưa đăng nhập</div>;
  }

  const handleSaveField = async (field: string, value: string) => {
    await updateProfile({ [field]: value });
  };

  const handlePortfolioUpload = (files: File[]) => {
    // In real app, upload files and get URLs
    console.log('Portfolio files:', files);
  };

  const tabs: TabItem[] = [
    {
      id: 'business',
      label: 'Thông tin doanh nghiệp',
      content: (
        <div className="space-y-4">
          <EditableField
            label="Tên công ty"
            value={user.companyName || ''}
            onSave={(val) => handleSaveField('companyName', val)}
          />
          <EditableField
            label="Mã số thuế"
            value={user.taxId || ''}
            onSave={(val) => handleSaveField('taxId', val)}
          />
          <EditableField
            label="Địa chỉ"
            value={user.companyAddress || ''}
            onSave={(val) => handleSaveField('companyAddress', val)}
          />
          <EditableField
            label="Số điện thoại"
            value={user.phone || ''}
            onSave={(val) => handleSaveField('phone', val)}
          />
          <EditableField
            label="Email liên hệ"
            value={user.email || ''}
            onSave={(val) => handleSaveField('email', val)}
          />
          <EditableField
            label="Mô tả doanh nghiệp"
            value={user.bio || ''}
            multiline
            onSave={(val) => handleSaveField('bio', val)}
          />
          <div className="glass-panel px-6 py-4 rounded-xl">
            <label className="text-silver text-sm font-medium">Loại sự kiện</label>
            <div className="flex gap-4 mt-3">
              {['Corporate', 'Birthday', 'Wedding'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-cyan" />
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
              <div className="mb-4 relative">
                <Avatar
                  src={user.avatar}
                  alt={user.companyName}
                  size="xl"
                  ring
                  className="mx-auto"
                />
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-semibold">
                  Đang hoạt động
                </div>
              </div>
              <h2 className="font-display text-2xl text-white mb-2 text-center">{user.companyName}</h2>
              <div className="flex justify-center items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan text-cyan" />
                ))}
                <span className="text-silver/60 text-xs ml-2">(256 đánh giá)</span>
              </div>
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan to-cyan/70 text-navy font-semibold hover:shadow-lg hover:shadow-cyan/30 transition-all">
                Chỉnh sửa hồ sơ
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
