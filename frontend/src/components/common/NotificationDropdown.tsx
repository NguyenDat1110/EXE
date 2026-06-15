import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationApi';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(1, 10);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="p-2 text-silver hover:text-cyan hover:bg-white/5 rounded-full transition-colors relative focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden glass-panel bg-navy/95 rounded-xl border border-white/10 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white">Thông báo</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-cyan hover:text-cyan-light transition-colors"
                >
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {loading ? (
                <div className="p-4 text-center text-slate-400 text-sm">Đang tải...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-slate-400 text-sm">Bạn không có thông báo nào</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${notif.isRead ? 'hover:bg-white/5 opacity-70' : 'bg-cyan/5 border border-cyan/10 hover:bg-cyan/10'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] text-slate-500">
                            {new Date(notif.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      
                      {!notif.isRead && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          className="p-1 rounded-full text-cyan hover:bg-cyan/20 transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 text-center bg-white/5">
              <button className="text-xs text-slate-400 hover:text-white transition-colors">
                Xem tất cả
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
