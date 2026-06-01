import { Request, Response } from 'express';
import { Package } from '../models/package.model';
import { Vendor } from '../models/vendor.model';
import { Booth } from '../models/booth.model';
import { AuthRequest } from '../middleware/auth.middleware';

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
      'isActive'
    ].forEach(f => {
      if (req.body[f] !== undefined) allowed[f] = req.body[f];
    });

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
