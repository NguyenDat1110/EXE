import React, { useState, useEffect } from 'react';
import { Search, Lock, Unlock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getAllUsers, lockUser, unlockUser } from '../../services/adminApi';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  vendorInfo?: {
    companyName: string;
    verificationStatus: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(search, selectedRole, page, 10);
      setUsers(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: string) => {
    try {
      setLockingId(userId);
      await lockUser(userId);
      setSuccessMessage('Đã khóa tài khoản người dùng');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi khóa tài khoản');
    } finally {
      setLockingId(null);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      setLockingId(userId);
      await unlockUser(userId);
      setSuccessMessage('Đã mở khóa tài khoản người dùng');
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi mở khóa tài khoản');
    } finally {
      setLockingId(null);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: any = {
      customer: { text: 'Khách hàng', color: 'bg-blue-500/20 text-blue-400' },
      vendor: { text: 'Nhà cung cấp', color: 'bg-purple-500/20 text-purple-400' },
      admin: { text: 'Admin', color: 'bg-red-500/20 text-red-400' }
    };
    return labels[role] || labels.customer;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Quản Lý Người Dùng</h1>
        <p className="text-silver/60 mt-1">Danh sách tất cả người dùng hệ thống (Khách hàng & Nhà cung cấp)</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 text-green-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo email hoặc tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan/50 transition-colors"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan/50 transition-colors appearance-none cursor-pointer"
        >
          <option value="all" className="bg-slate-900 text-white">Tất cả vai trò</option>
          <option value="customer" className="bg-slate-900 text-white">Khách hàng</option>
          <option value="vendor" className="bg-slate-900 text-white">Nhà cung cấp</option>
          <option value="admin" className="bg-slate-900 text-white">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải danh sách...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-silver/60">
                    Tên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-silver/60">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-silver/60 w-[140px]">
                    Vai Trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-silver/60">
                    Công Ty / SĐT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-silver/60">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-silver/60">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleLabel(user.role).color}`}>
                        {getRoleLabel(user.role).text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {user.vendorInfo?.companyName || user.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Hoạt động</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Đã khóa</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (user.isActive) {
                              handleLockUser(user._id);
                            } else {
                              handleUnlockUser(user._id);
                            }
                          }}
                          disabled={lockingId === user._id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                            user.isActive
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          } ${lockingId === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {lockingId === user._id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              Đang xử lý...
                            </>
                          ) : user.isActive ? (
                            <>
                              <Lock className="w-3 h-3" />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              Mở khóa
                            </>
                          )}
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <span className="text-xs text-slate-400">Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-400">
                Hiển thị {users.length} / {pagination.total} người dùng
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 glass-card rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Trước
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-cyan text-navy font-bold'
                          : 'glass-card hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 glass-card rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
