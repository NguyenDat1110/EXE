import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Target } from 'lucide-react';
import { getActivityLogs } from '../../services/adminApi';

interface LogData {
  _id: string;
  adminId: { _id: string, name: string, email: string };
  action: string;
  targetId: string;
  targetModel: string;
  details: any;
  createdAt: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getActivityLogs();
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'update_report_status': 'Cập nhật trạng thái khiếu nại',
      'toggle_package_status': 'Thay đổi trạng thái Package',
      'create_subscription_plan': 'Tạo gói Subscription',
      'update_subscription_plan': 'Cập nhật gói Subscription',
      'update_vendor_subscription': 'Cấp/Thu hồi VIP Vendor',
      'approve_vendor': 'Duyệt Vendor',
      'reject_vendor': 'Từ chối Vendor',
      'lock_user': 'Khóa User',
      'unlock_user': 'Mở khóa User',
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Log Hoạt Động</h1>
          <p className="text-silver/60 mt-1">Theo dõi nhật ký thao tác của quản trị viên.</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Admin Mode</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Đang tải dữ liệu...</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors flex gap-4 items-start">
                <div className="p-2 bg-white/10 rounded-lg shrink-0 mt-1">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium">{getActionLabel(log.action)}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <User className="w-4 h-4 text-cyan" />
                      <span className="text-slate-400">Admin:</span>
                      <span>{log.adminId?.name || 'Unknown'}</span>
                    </div>
                    
                    {log.targetModel && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Target className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-400">Đối tượng:</span>
                        <span>{log.targetModel} {log.targetId ? `(${log.targetId.substring(0,8)}...)` : ''}</span>
                      </div>
                    )}
                  </div>

                  {log.details && (
                    <div className="mt-3 text-xs bg-black/20 p-2.5 rounded-lg text-slate-400 font-mono overflow-x-auto">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-8 text-center text-slate-400">Không có log hoạt động nào</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
