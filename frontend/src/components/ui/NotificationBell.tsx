import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationApi';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data?.notifications ?? res.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications(); }}
        className="p-2 text-silver hover:text-cyan hover:bg-white/5 rounded-full transition-colors relative"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-cyan rounded-full text-[9px] font-bold text-navy flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-navy border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-semibold text-sm text-white">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-cyan hover:underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <p className="text-center text-silver text-sm py-6">Đang tải...</p>
              ) : notifications.length === 0 ? (
                <p className="text-center text-silver text-sm py-6">Không có thông báo</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleMarkRead(n._id)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-cyan/5' : ''}`}
                  >
                    <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-silver'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-silver/60 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-silver/40 mt-1">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
