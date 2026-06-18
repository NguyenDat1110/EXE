import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/user.model';
import { Vendor } from '../models/vendor.model';
import { Booking } from '../models/booking.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../services/email.service';
import { ActivityLog } from '../models/activityLog.model';

// UC-37: Admin Dashboard - Tổng quan hệ thống
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    // Tổng số user
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });

    // Vendor stats
    const pendingVendors = await Vendor.countDocuments({ verificationStatus: 'pending' });
    const approvedVendors = await Vendor.countDocuments({ verificationStatus: 'approved' });
    const rejectedVendors = await Vendor.countDocuments({ verificationStatus: 'rejected' });

    // Booking stats (tháng hiện tại)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    // Doanh thu tháng này
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          paymentStatus: { $in: ['deposit_paid', 'final_paid'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    const revenue = monthlyRevenue[0]?.total || 0;

    // Growth chart data (7 ngày gần nhất)
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      growthData.push({
        date: startOfDay.toLocaleDateString('vi-VN'),
        bookings: dayBookings
      });
    }

    res.status(200).json({
      message: 'Lấy thống kê dashboard thành công',
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          vendors: totalVendors
        },
        vendors: {
          pending: pendingVendors,
          approved: approvedVendors,
          rejected: rejectedVendors
        },
        bookings: {
          monthly: monthlyBookings
        },
        revenue: {
          monthly: revenue
        },
        growthChart: growthData
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-38: Admin quản lý người dùng - Danh sách tất cả user
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { search, role, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Lấy danh sách user
    const users = await User.find(filter)
      .select('-passwordHash')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Tổng số user
    const total = await User.countDocuments(filter);

    // Thêm thông tin vendor nếu là vendor
    const usersWithVendorInfo = await Promise.all(
      users.map(async (user) => {
        let vendorInfo = null;
        if (user.role === 'vendor') {
          vendorInfo = await Vendor.findOne({ userId: user._id }).select('companyName verificationStatus');
        }
        return {
          ...user.toObject(),
          vendorInfo
        };
      })
    );

    res.status(200).json({
      message: 'Lấy danh sách người dùng thành công',
      data: usersWithVendorInfo,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-38: Admin khóa tài khoản người dùng
export const lockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { userId } = req.params;

    // Không cho khóa tài khoản admin
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ message: 'Không thể khóa tài khoản admin' });
      return;
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: 'Đã khóa tài khoản người dùng',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Lock user error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-38: Admin mở khóa tài khoản người dùng
export const unlockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      message: 'Đã mở khóa tài khoản người dùng',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Get user detail
export const getUserDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { userId } = req.params;

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    let vendorInfo = null;
    if (user.role === 'vendor') {
      vendorInfo = await Vendor.findOne({ userId: user._id });
    }

    res.status(200).json({
      message: 'Lấy thông tin người dùng thành công',
      data: {
        ...user.toObject(),
        vendorInfo
      }
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-09: Admin duyệt hồ sơ Vendor - Lấy danh sách vendor pending
export const getPendingVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { status = 'pending', page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get vendors with specified status
    const vendors = await Vendor.find({ verificationStatus: status })
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments({ verificationStatus: status });

    res.status(200).json({
      message: 'Lấy danh sách vendor thành công',
      data: vendors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-09: Admin duyệt hồ sơ Vendor - Phê duyệt vendor
export const approveVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { vendorId } = req.params;

    // Find vendor
    const vendor = await Vendor.findById(vendorId).populate('userId');
    if (!vendor) {
      res.status(404).json({ message: 'Vendor không tồn tại' });
      return;
    }

    // Check if already approved
    if (vendor.verificationStatus === 'approved') {
      res.status(400).json({ message: 'Vendor này đã được phê duyệt rồi' });
      return;
    }

    // Update vendor status
    vendor.verificationStatus = 'approved';
    vendor.isVerified = true;
    await vendor.save();

    // Send approval email
    await sendVendorApprovalEmail(vendor.email, vendor.companyName);

    res.status(200).json({
      message: 'Phê duyệt vendor thành công!',
      data: vendor
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-09: Admin duyệt hồ sơ Vendor - Từ chối vendor
export const rejectVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { vendorId } = req.params;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string') {
      res.status(400).json({ message: 'Vui lòng cung cấp lý do từ chối' });
      return;
    }

    // Find vendor
    const vendor = await Vendor.findById(vendorId).populate('userId');
    if (!vendor) {
      res.status(404).json({ message: 'Vendor không tồn tại' });
      return;
    }

    // Check if already rejected
    if (vendor.verificationStatus === 'rejected') {
      res.status(400).json({ message: 'Vendor này đã bị từ chối rồi' });
      return;
    }

    // Update vendor status
    vendor.verificationStatus = 'rejected';
    vendor.verificationReason = reason.trim();
    await vendor.save();

    // Send rejection email with reason
    await sendVendorRejectionEmail(vendor.email, vendor.companyName, reason);

    res.status(200).json({
      message: 'Từ chối vendor thành công!',
      data: vendor
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-42: Admin xem log hoạt động hệ thống
export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Chỉ admin mới có quyền.' }); return; }

    const { page = 1, limit = 20, action, resource } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (resource) filter.resource = resource;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email role')
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.status(200).json({ logs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// UC-41: Admin xem danh sách gói subscription
export const adminGetSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Chỉ admin mới có quyền.' }); return; }

    const { plan, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};
    if (plan && plan !== 'all') filter.subscriptionPlan = plan;
    if (status && status !== 'all') filter.subscriptionStatus = status;

    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email')
        .select('companyName subscriptionPlan subscriptionStatus subscriptionExpiry userId')
        .lean(),
      Vendor.countDocuments(filter)
    ]);

    res.status(200).json({ vendors, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error('Admin get subscriptions error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// UC-43: Admin gia hạn gói VIP thủ công
export const adminExtendSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Chỉ admin mới có quyền.' }); return; }

    const { vendorId } = req.params;
    const { plan = 'vip', days = 365 } = req.body;

    if (!Types.ObjectId.isValid(vendorId)) { res.status(400).json({ message: 'Vendor ID không hợp lệ.' }); return; }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) { res.status(404).json({ message: 'Không tìm thấy vendor.' }); return; }

    const now = new Date();
    const base = vendor.subscriptionExpiry && vendor.subscriptionExpiry > now ? vendor.subscriptionExpiry : now;
    const newExpiry = new Date(base);
    newExpiry.setDate(newExpiry.getDate() + Number(days));

    vendor.subscriptionPlan = plan as 'basic' | 'vip';
    vendor.subscriptionExpiry = newExpiry;
    vendor.subscriptionStatus = 'active';
    await vendor.save();

    res.status(200).json({ message: `Gia hạn gói ${plan} thành công.`, vendor: { subscriptionPlan: vendor.subscriptionPlan, subscriptionExpiry: vendor.subscriptionExpiry, subscriptionStatus: vendor.subscriptionStatus } });
  } catch (error) {
    console.error('Admin extend subscription error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// UC-43: Admin thu hồi gói VIP
export const adminRevokeSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Chỉ admin mới có quyền.' }); return; }

    const { vendorId } = req.params;
    if (!Types.ObjectId.isValid(vendorId)) { res.status(400).json({ message: 'Vendor ID không hợp lệ.' }); return; }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) { res.status(404).json({ message: 'Không tìm thấy vendor.' }); return; }

    vendor.subscriptionStatus = 'inactive';
    vendor.subscriptionExpiry = undefined;
    await vendor.save();

    res.status(200).json({ message: 'Thu hồi gói subscription thành công.' });
  } catch (error) {
    console.error('Admin revoke subscription error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
