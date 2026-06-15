import { Request, Response } from 'express';
import { Vendor } from '../models/vendor.model';
import { Report } from '../models/report.model';
import { SubscriptionPlan } from '../models/subscriptionPlan.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper to log admin activity
const logActivity = async (adminId: string, action: string, targetId?: string, targetModel?: string, details?: any) => {
  try {
    await ActivityLog.create({ adminId, action, targetId, targetModel, details });
  } catch (err) {
    console.error('Failed to log admin activity', err);
  }
};

// ==========================================
// UC-39: Admin quản lý nội dung Package
// ==========================================
export const getAllPackages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    // Lấy tất cả vendor và package của họ
    const vendors = await Vendor.find().select('companyName packages');
    
    // Flatten the packages array and attach vendor info
    const allPackages = vendors.flatMap(vendor => 
      vendor.packages.map(pkg => ({
        ...pkg.toObject(),
        vendorId: vendor._id,
        vendorName: vendor.companyName
      }))
    );

    // Sort by newest
    allPackages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      message: 'Lấy danh sách package thành công',
      data: allPackages
    });
  } catch (error) {
    console.error('Get all packages error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const togglePackageStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { vendorId, packageId } = req.params;
    const { isActive } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor không tồn tại' });
      return;
    }

    const pkg = vendor.packages.id(packageId);
    if (!pkg) {
      res.status(404).json({ message: 'Package không tồn tại' });
      return;
    }

    pkg.isActive = isActive;
    await vendor.save();

    await logActivity(req.user._id, 'toggle_package_status', packageId, 'Package', { isActive, vendorId });

    res.status(200).json({ message: 'Cập nhật trạng thái package thành công', data: pkg });
  } catch (error) {
    console.error('Toggle package status error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// ==========================================
// UC-40: Admin xem & xử lý khiếu nại
// ==========================================
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Lấy danh sách khiếu nại thành công', data: reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, adminNotes },
      { new: true }
    );

    if (!report) {
      res.status(404).json({ message: 'Khiếu nại không tồn tại' });
      return;
    }

    await logActivity(req.user._id, 'update_report_status', reportId, 'Report', { status, adminNotes });

    res.status(200).json({ message: 'Cập nhật khiếu nại thành công', data: report });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// ==========================================
// UC-41: Admin quản lý gói Subscription
// ==========================================
export const getSubscriptionPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    res.status(200).json({ message: 'Lấy danh sách gói thành công', data: plans });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const createSubscriptionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const plan = await SubscriptionPlan.create(req.body);
    await logActivity(req.user._id, 'create_subscription_plan', plan._id as string, 'SubscriptionPlan', req.body);

    res.status(201).json({ message: 'Tạo gói thành công', data: plan });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const updateSubscriptionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { planId } = req.params;
    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, req.body, { new: true });
    
    if (!plan) {
      res.status(404).json({ message: 'Gói không tồn tại' });
      return;
    }

    await logActivity(req.user._id, 'update_subscription_plan', planId, 'SubscriptionPlan', req.body);

    res.status(200).json({ message: 'Cập nhật gói thành công', data: plan });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// ==========================================
// UC-43: Admin gia hạn/thu hồi gói VIP thủ công
// ==========================================
export const updateVendorSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const { vendorId } = req.params;
    const { action, planType, days } = req.body; // action: 'extend' | 'revoke'

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor không tồn tại' });
      return;
    }

    if (action === 'revoke') {
      vendor.subscriptionPlan = undefined;
      vendor.subscriptionExpiry = undefined;
      vendor.subscriptionStatus = 'inactive';
    } else if (action === 'extend') {
      const currentExpiry = vendor.subscriptionExpiry && vendor.subscriptionExpiry > new Date() 
        ? vendor.subscriptionExpiry 
        : new Date();
      
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + (days || 30));

      vendor.subscriptionPlan = planType || vendor.subscriptionPlan || 'basic';
      vendor.subscriptionExpiry = newExpiry;
      vendor.subscriptionStatus = 'active';
    }

    await vendor.save();
    await logActivity(req.user._id, 'update_vendor_subscription', vendorId, 'Vendor', { action, planType, days });

    res.status(200).json({ message: 'Cập nhật VIP thành công', data: vendor });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// ==========================================
// UC-42: Admin xem log hoạt động hệ thống
// ==========================================
export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const logs = await ActivityLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ message: 'Lấy log thành công', data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
