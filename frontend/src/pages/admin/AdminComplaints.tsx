import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, Search, Filter, CheckCircle2, ShieldBan, X } from 'lucide-react';
import { getReports, updateReportStatus } from '../../services/adminApi';

interface ReportData {
  _id: string;
  reporterId: { _id: string, name: string, email: string };
  targetId: string;
  targetModel: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export default function AdminComplaints() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const notes = prompt('Nhập ghi chú xử lý (tùy chọn):', '');
    if (notes === null) return; // cancelled

    try {
      await updateReportStatus(reportId, status, notes);
      setReports(reports.map(r => r._id === reportId ? { ...r, status, adminNotes: notes } : r));
    } catch (err) {
      console.error('Failed to update report status', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredReports = reports.filter(r => 
    r.reason.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.reporterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Xử Lý Khiếu Nại</h1>
          <p className="text-silver/60 mt-1">Xem xét và giải quyết các báo cáo từ người dùng.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Admin Mode</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khiếu nại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-200">Lọc</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-4 font-medium">Người báo cáo</th>
                  <th className="py-4 font-medium">Loại / Lý do</th>
                  <th className="py-4 font-medium">Chi tiết</th>
                  <th className="py-4 font-medium">Trạng thái</th>
                  <th className="py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{report.reporterId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="py-4">
                      <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-xs text-slate-300 mb-1">
                        {report.targetModel}
                      </span>
                      <div className="text-sm font-medium text-red-400">{report.reason}</div>
                    </td>
                    <td className="py-4 text-sm text-slate-300 max-w-xs">
                      <p className="truncate">{report.description}</p>
                      {report.adminNotes && (
                        <p className="text-xs text-cyan mt-1 truncate">Admin: {report.adminNotes}</p>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        report.status === 'dismissed' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {report.status === 'resolved' ? 'Đã xử lý' : report.status === 'dismissed' ? 'Đã bỏ qua' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {report.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(report._id, 'resolved')}
                            className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Đánh dấu đã xử lý"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors"
                            title="Bỏ qua khiếu nại"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Không có khiếu nại nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
