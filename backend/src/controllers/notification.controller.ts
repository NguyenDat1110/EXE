import { Response } from 'express';
<<<<<<< HEAD
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';
import { Types } from 'mongoose';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.status(200).json({
      notifications,
      unreadCount,
      page: Number(page),
      limit: Number(limit)
    });
=======
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { INotification, Notification } from '../models/notification.model';

export const createNotification = async (
  userId: string | Types.ObjectId,
  type: INotification['type'],
  title: string,
  message: string,
  relatedId?: string | Types.ObjectId,
  relatedModel?: string
): Promise<void> => {
  try {
    await Notification.create({
      userId: new Types.ObjectId(String(userId)),
      type,
      title,
      message,
      isRead: false,
      ...(relatedId ? { relatedId: new Types.ObjectId(String(relatedId)) } : {}),
      ...(relatedModel ? { relatedModel } : {})
    });
  } catch (err) {
    console.error('Create notification error:', err);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, isRead: false })
    ]);

    res.status(200).json({ notifications, unreadCount, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
>>>>>>> 2c2104e232045224b0df3fdfd9e1d16ab542c5f5
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const { notificationId } = req.params;

    if (!notificationId || !Types.ObjectId.isValid(notificationId)) {
      res.status(400).json({ message: 'Mã thông báo không hợp lệ.' });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo.' });
      return;
    }

    res.status(200).json({ message: 'Đã đánh dấu đọc', notification });
  } catch (error) {
    console.error('Mark notification error:', error);
=======
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) { res.status(400).json({ message: 'ID không hợp lệ.' }); return; }

    const notification = await Notification.findOneAndUpdate({ _id: id, userId: req.user.id }, { isRead: true }, { new: true });
    if (!notification) { res.status(404).json({ message: 'Không tìm thấy thông báo.' }); return; }

    res.status(200).json({ message: 'Đã đánh dấu là đã đọc.', notification });
  } catch (error) {
    console.error('Mark as read error:', error);
>>>>>>> 2c2104e232045224b0df3fdfd9e1d16ab542c5f5
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    console.error('Mark all notifications error:', error);
=======
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc.' });
  } catch (error) {
    console.error('Mark all as read error:', error);
>>>>>>> 2c2104e232045224b0df3fdfd9e1d16ab542c5f5
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
