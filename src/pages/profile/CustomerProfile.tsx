import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Calendar, Edit2, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { PasswordStrength } from '../../components/ui/PasswordStrength';

interface EditableFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onSave: (value: string) => void;
}

function EditableField({ label, value, icon, onSave }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel px-6 py-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {icon && <div className="text-cyan/60">{icon}</div>}
        <div>
          <p className="text-silver/60 text-sm">{label}</p>
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-white/5 text-white px-2 py-1 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan w-full max-w-xs mt-1"
            />
          ) : (
            <p className="text-white font-medium">{value || 'Chưa cập nhật'}</p>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-2"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
            className="text-red-400 hover:text-red-300 transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-cyan/60 group-hover:text-cyan transition-colors p-2 opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function CustomerProfile() {
  const { user, updateProfile } = useAuthStore();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!user) {
    return <div>Chưa đăng nhập</div>;
  }

  const handleSaveField = async (field: string, value: string) => {
    await updateProfile({ [field]: value });
  };

  const tabs: TabItem[] = [
    {
      id: 'personal',
      label: 'Thông tin cá nhân',
      content: (
        <div className="space-y-4">
          <EditableField
            label="Họ tên"
            value={user.name}
            icon={<Edit2 className="w-5 h-5" />}
            onSave={(val) => handleSaveField('name', val)}
          />
          <EditableField
            label="Email"
            value={user.email}
            icon={<Mail className="w-5 h-5" />}
            onSave={(val) => handleSaveField('email', val)}
          />
          <EditableField
            label="Số điện thoại"
            value={user.phone || ''}
            icon={<Phone className="w-5 h-5" />}
            onSave={(val) => handleSaveField('phone', val)}
          />
          <EditableField
            label="Ngày sinh"
            value={user.dateOfBirth || ''}
            icon={<Calendar className="w-5 h-5" />}
            onSave={(val) => handleSaveField('dateOfBirth', val)}
          />
          <EditableField
            label="Địa chỉ"
            value={user.address || ''}
            icon={<MapPin className="w-5 h-5" />}
            onSave={(val) => handleSaveField('address', val)}
          />

          {/* Password Section */}
          <div className="glass-panel px-6 py-4 rounded-xl space-y-4">
            <h3 className="text-white font-semibold">Đổi mật khẩu</h3>
            <div>
              <label className="text-silver/60 text-sm">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan mt-2"
              />
            </div>
            <div>
              <label className="text-silver/60 text-sm">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 text-white px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan mt-2"
              />
              {newPassword && <PasswordStrength password={newPassword} />}
            </div>
            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan to-cyan/70 text-navy font-semibold hover:shadow-lg hover:shadow-cyan/30 transition-all">
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'bookings',
      label: 'Lịch sử Booking',
      content: (
        <div className="space-y-4">
          <div className="glass-panel px-6 py-8 rounded-xl text-center">
            <Heart className="w-12 h-12 text-silver/40 mx-auto mb-3" />
            <p className="text-silver/60">Chưa có booking nào</p>
            <p className="text-silver/40 text-sm mt-1">Khám phá các vendor tuyệt vời</p>
          </div>
        </div>
      ),
    },
    {
      id: 'saved',
      label: 'Đã Lưu',
      content: (
        <div className="space-y-4">
          <div className="glass-panel px-6 py-8 rounded-xl text-center">
            <Heart className="w-12 h-12 text-silver/40 mx-auto mb-3" />
            <p className="text-silver/60">Chưa lưu vendor nào</p>
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
            <h1 className="font-display text-4xl text-white mb-2">Hồ Sơ Cá Nhân</h1>
            <p className="text-silver/60">Quản lý thông tin và booking của bạn</p>
          </div>

          {/* Profile Grid */}
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
            {/* Left Column - Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-2xl text-center"
            >
              <div className="mb-4">
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  size="xl"
                  ring
                  className="mx-auto"
                />
              </div>
              <h2 className="font-display text-2xl text-white mb-1">{user.name}</h2>
              <p className="text-silver/60 text-sm mb-4">{user.email}</p>
              <p className="text-silver/40 text-xs">
                Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <button className="w-full mt-6 py-2 rounded-lg bg-gradient-to-r from-cyan to-cyan/70 text-navy font-semibold hover:shadow-lg hover:shadow-cyan/30 transition-all">
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
              <Tabs tabs={tabs} defaultTab="personal" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
