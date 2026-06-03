import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Booth } from '../models/booth.model';
import { Vendor } from '../models/vendor.model';
import { Package } from '../models/package.model';

const EVENT_TYPE_TO_CATEGORY: Record<string, 'birthday' | 'business'> = {
  'TIỆC SINH NHẬT': 'birthday',
  'TIỆC DOANH NGHIỆP': 'business',
  // Backward-compatible aliases for existing records / old forms.
  'SINH NHẬT': 'birthday',
  'HỘI THẢO': 'business',
  'TIỆC CƯỚI': 'business',
  'KỈ NIỆM': 'business'
};

const getVendorForUser = async (userId: string) => {
  return Vendor.findOne({ userId });
};

export const createBooth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    // Vendor must be approved and have an active subscription to create a booth
    if (vendor.verificationStatus !== 'approved') {
      res.status(403).json({ message: 'Hồ sơ doanh nghiệp chưa được phê duyệt. Vui lòng nộp hồ sơ và chờ admin duyệt.' });
      return;
    }

    const now = new Date();
    const hasActiveSubscription = vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > now;
    if (!hasActiveSubscription) {
      res.status(403).json({ message: 'Bạn cần mua gói dịch vụ để tạo gian hàng.' });
      return;
    }

    const { name, eventType, description, address, coverImage, gallery } = req.body;
    if (!name || !eventType) {
      res.status(400).json({ message: 'Vui lòng nhập tên gian hàng và loại sự kiện.' });
      return;
    }

    const normalizedEventType = String(eventType).trim().toUpperCase();
    if (!EVENT_TYPE_TO_CATEGORY[normalizedEventType]) {
      res.status(400).json({ message: 'Loại sự kiện không hợp lệ.' });
      return;
    }

    const booth = await Booth.create({
      vendorId: vendor._id,
      name: String(name).trim(),
      category: EVENT_TYPE_TO_CATEGORY[normalizedEventType],
      eventType: normalizedEventType,
      description: String(description || '').trim(),
      address: String(address || '').trim(),
      coverImage: String(coverImage || '').trim(),
      gallery: Array.isArray(gallery) ? gallery.map((item) => String(item).trim()).filter(Boolean) : [],
      isActive: true
    });

    res.status(201).json({ message: 'Tạo gian hàng thành công', booth });
  } catch (error) {
    console.error('Create booth error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getBooths = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    const booths = await Booth.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    res.status(200).json({ data: booths });
  } catch (error) {
    console.error('Get booths error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const updateBooth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      res.status(404).json({ message: 'Không tìm thấy gian hàng.' });
      return;
    }

    if (!booth.vendorId.equals(vendor._id)) {
      res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa gian hàng này.' });
      return;
    }

    const { name, eventType, description, address, coverImage, gallery, isActive } = req.body;
    if (name !== undefined) booth.name = String(name).trim();
    if (eventType !== undefined) {
      const normalizedEventType = String(eventType).trim().toUpperCase();
      if (!EVENT_TYPE_TO_CATEGORY[normalizedEventType]) {
        res.status(400).json({ message: 'Loại sự kiện không hợp lệ.' });
        return;
      }
      booth.eventType = normalizedEventType as any;
      booth.category = EVENT_TYPE_TO_CATEGORY[normalizedEventType];
    }
    if (description !== undefined) booth.description = String(description).trim();
    if (address !== undefined) booth.address = String(address).trim();
    if (coverImage !== undefined) booth.coverImage = String(coverImage).trim();
    if (gallery !== undefined) {
      booth.gallery = Array.isArray(gallery) ? gallery.map((item: unknown) => String(item).trim()).filter(Boolean) : [];
    }
    if (isActive !== undefined) booth.isActive = Boolean(isActive);

    await booth.save();
    res.status(200).json({ message: 'Cập nhật gian hàng thành công', booth });
  } catch (error) {
    console.error('Update booth error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const toggleBoothVisibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      res.status(404).json({ message: 'Không tìm thấy gian hàng.' });
      return;
    }

    if (!booth.vendorId.equals(vendor._id)) {
      res.status(403).json({ message: 'Bạn không có quyền thay đổi gian hàng này.' });
      return;
    }

    booth.isActive = !booth.isActive;
    await booth.save();
    res.status(200).json({ message: 'Cập nhật trạng thái gian hàng thành công', booth });
  } catch (error) {
    console.error('Toggle booth error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const deleteBooth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      res.status(404).json({ message: 'Không tìm thấy gian hàng.' });
      return;
    }

    if (!booth.vendorId.equals(vendor._id)) {
      res.status(403).json({ message: 'Bạn không có quyền xóa gian hàng này.' });
      return;
    }

    await Package.deleteMany({ boothId: booth._id, vendorId: vendor._id });
    await booth.deleteOne();

    res.status(200).json({ message: 'Xóa gian hàng thành công' });
  } catch (error) {
    console.error('Delete booth error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
