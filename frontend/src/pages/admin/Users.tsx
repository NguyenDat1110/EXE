import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const dummyUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'customer', status: 'active' },
    { id: 2, name: 'Vendor Studio B', email: 'studiob@gmail.com', role: 'vendor', status: 'pending' },
    { id: 3, name: 'Trần Thị C', email: 'tranc@gmail.com', role: 'customer', status: 'active' },
    { id: 4, name: 'Admin Pick', email: 'admin@clickpick.com', role: 'admin', status: 'active' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Quản Lý Tài Khoản</h1>
        <p className="text-silver/60 mt-1">Danh sách tất cả các tài khoản trên hệ thống ClickPick.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-silver text-sm">
                <th className="p-4 font-semibold">Tên người dùng</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {dummyUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{user.name}</td>
                  <td className="p-4 text-silver/80">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      user.role === 'vendor' ? 'bg-cyan/20 text-cyan border border-cyan/35' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      user.status === 'active' ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`} />
                      {user.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-1 text-cyan hover:bg-cyan/10 rounded transition-colors" title="Phê duyệt">
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Khóa">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
