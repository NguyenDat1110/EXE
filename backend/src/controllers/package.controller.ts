import { Request, Response } from 'express';
import { Package } from '../models/package.model';
import { Vendor } from '../models/vendor.model';
import { Booth } from '../models/booth.model';
import { AuthRequest } from '../middleware/auth.middleware';

const MAX_PACKAGE_IMAGES = 10;

// Business rules shared by create/update. Returns an error message or null if valid.
const validatePackageInput = (input: {
  name: unknown;
  price: unknown;
  minParticipants: unknown;
  maxParticipants: unknown;
  depositAmount: unknown;
  images: unknown;
}): string | null => {
  if (typeof input.name !== 'string' || !input.name.trim()) {
    return 'Vui lòng nhập tên gói dịch vụ.';
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0) {
    return 'Mức giá phải lớn hơn 0.';
  }

  const minParticipants = Number(input.minParticipants);
  const maxParticipants = Number(input.maxParticipants);
  if (!Number.isFinite(minParticipants) || minParticipants <= 0) {
    return 'Số người tối thiểu phải lớn hơn 0.';
  }
  if (!Number.isFinite(maxParticipants) || maxParticipants < minParticipants) {
    return 'Số người tối đa phải lớn hơn hoặc bằng số tối thiểu.';
  }

  const depositAmount = Number(input.depositAmount);
  if (!Number.isFinite(depositAmount) || depositAmount < 0) {
    return 'Tiền cọc không được âm.';
  }
  if (depositAmount > price) {
    return 'Tiền cọc không được lớn hơn mức giá.';
  }

  if (!Array.isArray(input.images) || input.images.some((img) => typeof img !== 'string')) {
    return 'Danh sách ảnh không hợp lệ.';
  }
  if (input.images.length === 0) {
    return 'Cần ít nhất một ảnh minh họa.';
  }
  if (input.images.length > MAX_PACKAGE_IMAGES) {
    return `Chỉ được tải tối đa ${MAX_PACKAGE_IMAGES} ảnh cho mỗi package.`;
  }

  return null;
};

// Create package
export const createPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    // Find vendor by user
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    // Vendor must be approved and have active subscription to create packages
    if (vendor.verificationStatus !== 'approved') {
      res.status(403).json({ message: 'Hồ sơ doanh nghiệp chưa được phê duyệt. Không thể tạo gói.' });
      return;
    }

    const now = new Date();
    const hasActiveSubscription = vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > now;
    if (!hasActiveSubscription) {
      res.status(403).json({ message: 'Bạn cần mua gói (subscription) để tạo gói dịch vụ.' });
      return;
    }

    const {
      boothId,
      name,
      description,
      price,
      includedServices,
      minParticipants,
      maxParticipants,
      depositAmount,
      serviceDuration,
      images,
      model3dUrl
    } = req.body;

    if (!boothId) {
      res.status(400).json({ message: 'Vui lòng chọn gian hàng cho gói dịch vụ.' });
      return;
    }

    const validationError = validatePackageInput({
      name,
      price,
      minParticipants,
      maxParticipants,
      depositAmount: depositAmount === undefined ? 0 : depositAmount,
      images: images === undefined ? [] : images
    });
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const booth = await Booth.findById(boothId);
    if (!booth || !booth.vendorId.equals(vendor._id)) {
      res.status(404).json({ message: 'Không tìm thấy gian hàng hợp lệ.' });
      return;
    }

    if (model3dUrl && vendor.subscriptionPlan !== 'vip') {
      res.status(403).json({ message: 'Chức năng 3D yêu cầu gói VIP. Vui lòng nâng cấp.' });
      return;
    }

    const pkg = await Package.create({
      boothId: booth._id,
      vendorId: vendor._id,
      name,
      description,
      price,
      includedServices: includedServices || [],
      minParticipants: Number(minParticipants) || 0,
      maxParticipants: Number(maxParticipants) || 0,
      depositAmount: Number(depositAmount) || 0,
      serviceDuration: serviceDuration || '',
      images: images || [],
      model3dUrl: model3dUrl || '',
      isActive: true
    });

    res.status(201).json({ message: 'Tạo gói dịch vụ thành công', package: pkg });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Update package
export const updatePackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const pkgId = req.params.id;
    const pkg = await Package.findById(pkgId);
    if (!pkg) {
      res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    if (!pkg.vendorId.equals(vendor._id)) {
      res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa gói này.' });
      return;
    }

    const now = new Date();
    const hasActiveSubscription = vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > now;
    if (!hasActiveSubscription) {
      res.status(403).json({ message: 'Gói dịch vụ (subscription) của bạn đã hết hạn. Vui lòng gia hạn để chỉnh sửa gói.' });
      return;
    }

    // If attempting to set model3dUrl ensure VIP
    if (req.body.model3dUrl && vendor.subscriptionPlan !== 'vip') {
      res.status(403).json({ message: 'Tính năng 3D yêu cầu gói VIP.' });
      return;
    }

    if (req.body.boothId) {
      const nextBooth = await Booth.findById(req.body.boothId);
      if (!nextBooth || !nextBooth.vendorId.equals(vendor._id)) {
        res.status(400).json({ message: 'Gian hàng không hợp lệ.' });
        return;
      }
    }

    // Update allowed fields
    const allowed: any = {};
    [
      'boothId',
      'name',
      'description',
      'price',
      'includedServices',
      'minParticipants',
      'maxParticipants',
      'depositAmount',
      'serviceDuration',
      'images',
      'model3dUrl',
      'stageLayout',
      'isActive'
    ].forEach(f => {
      if (req.body[f] !== undefined) allowed[f] = req.body[f];
    });

    // Validate the merged result so partial updates can't break business rules
    const validationError = validatePackageInput({
      name: allowed.name !== undefined ? allowed.name : pkg.name,
      price: allowed.price !== undefined ? allowed.price : pkg.price,
      minParticipants: allowed.minParticipants !== undefined ? allowed.minParticipants : pkg.minParticipants,
      maxParticipants: allowed.maxParticipants !== undefined ? allowed.maxParticipants : pkg.maxParticipants,
      depositAmount: allowed.depositAmount !== undefined ? allowed.depositAmount : pkg.depositAmount,
      images: allowed.images !== undefined ? allowed.images : pkg.images
    });
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    Object.assign(pkg, allowed);
    await pkg.save();

    res.status(200).json({ message: 'Cập nhật gói thành công', package: pkg });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Toggle visibility
export const togglePackageVisibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const pkgId = req.params.id;
    const pkg = await Package.findById(pkgId);
    if (!pkg) {
      res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    if (!pkg.vendorId.equals(vendor._id)) {
      res.status(403).json({ message: 'Bạn không có quyền thay đổi gói này.' });
      return;
    }

    pkg.isActive = !pkg.isActive;
    await pkg.save();

    res.status(200).json({ message: 'Cập nhật trạng thái thành công', package: pkg });
  } catch (error) {
    console.error('Toggle package error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Get vendor packages
export const getVendorPackages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    const boothId = req.query.boothId as string | undefined;
    const filter: any = { vendorId: vendor._id };

    if (boothId) {
      filter.boothId = boothId;
    }

    const pkgs = await Package.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ data: pkgs });
  } catch (error) {
    console.error('Get vendor packages error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const deletePackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    if (!pkg.vendorId.equals(vendor._id)) {
      res.status(403).json({ message: 'Bạn không có quyền xóa gói này.' });
      return;
    }

    await pkg.deleteOne();
    res.status(200).json({ message: 'Xóa gói dịch vụ thành công' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Public package detail (for customers)
export const getPublicPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const pkgId = req.params.id;
    const pkg = await Package.findById(pkgId).lean();
    if (!pkg) {
      res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
      return;
    }

    const vendor = await Vendor.findById((pkg as any).vendorId).lean();
    const booth = await Booth.findById((pkg as any).boothId).lean();

    res.status(200).json({ data: { package: pkg, vendor, booth } });
  } catch (error) {
    console.error('Get public package error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
