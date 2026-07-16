import { Request, Response } from 'express';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { Vendor } from '../models/vendor.model';
import { VendorRegistration } from '../models/vendor-registration.model';
import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from './notification.controller';

const normalizeBusinessLicense = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const sanitizeFilename = (fileName: string): string => {
  return fileName
    .normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '') || 'license';
};

const extensionFromMimeType = (mimeType: string, originalName: string): string => {
  const normalized = originalName.toLowerCase();
  if (normalized.endsWith('.pdf') || mimeType === 'application/pdf') return '.pdf';
  if (normalized.endsWith('.png') || mimeType === 'image/png') return '.png';
  if (normalized.endsWith('.webp') || mimeType === 'image/webp') return '.webp';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg') || mimeType === 'image/jpeg') return '.jpg';
  return '';
};

export const uploadVendorLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!file) {
      res.status(400).json({ message: 'Thiếu tệp cần tải lên.' });
      return;
    }

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      res.status(400).json({ message: 'Chỉ hỗ trợ PDF, JPG, PNG và WEBP.' });
      return;
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'business-licenses');
    await mkdir(uploadsDir, { recursive: true });

    const originalName = file.originalname || 'license';
    const safeBaseName = sanitizeFilename(originalName.replace(/\.[^.]+$/, ''));
    const extension = extensionFromMimeType(file.mimetype, originalName);
    const storedFileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
    const filePath = path.join(uploadsDir, storedFileName);

    await writeFile(filePath, file.buffer);

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/business-licenses/${storedFileName}`;

    res.status(201).json({
      message: 'Tải lên giấy phép thành công.',
      fileUrl: publicUrl,
      fileName: originalName,
      mimeType: file.mimetype,
    });
  } catch (error) {
    console.error('Upload vendor license error:', error);
    res.status(500).json({ message: 'Không thể tải lên giấy phép. Vui lòng thử lại.' });
  }
};

const SHARED_FIELDS = [
  'companyName', 'taxId', 'accountHolderName', 'accountNumber', 'bankName',
  'businessLicense', 'businessLicenseNames',
] as const;

function pickShared(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const field of SHARED_FIELDS) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}

export const submitVendorInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const { companyName, taxId, companyAddress, businessLicense, businessLicenseNames, phone, email, website, bio, avatar,
      accountHolderName, accountNumber, bankName } = req.body;

    const fieldErrors: Record<string, string> = {};
    if (!companyName || !String(companyName).trim()) fieldErrors.companyName = 'Tên công ty là bắt buộc.';
    if (!taxId || !String(taxId).trim()) fieldErrors.taxId = 'Mã số thuế là bắt buộc.';
    if (!companyAddress || !String(companyAddress).trim()) fieldErrors.companyAddress = 'Địa chỉ công ty là bắt buộc.';
    if (!accountHolderName || !String(accountHolderName).trim()) fieldErrors.accountHolderName = 'Tên chủ tài khoản là bắt buộc.';
    if (!accountNumber || !String(accountNumber).trim()) fieldErrors.accountNumber = 'Số tài khoản là bắt buộc.';
    if (!bankName || !String(bankName).trim()) fieldErrors.bankName = 'Tên ngân hàng là bắt buộc.';

    if (!phone || !String(phone).trim()) {
      fieldErrors.phone = 'Số điện thoại là bắt buộc.';
    } else {
      const digits = String(phone).replace(/\D/g, '');
      if (digits.length !== 10) fieldErrors.phone = 'Số điện thoại phải gồm 10 chữ số.';
    }

    if (!email || !String(email).trim()) {
      fieldErrors.email = 'Email là bắt buộc.';
    } else {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(String(email).toLowerCase())) fieldErrors.email = 'Email không hợp lệ.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      res.status(400).json({ message: 'Thiếu trường bắt buộc.', errors: fieldErrors });
      return;
    }

    // Save to VendorRegistration
    const normalizedLicense = normalizeBusinessLicense(businessLicense);
    const normalizedLicenseNames = normalizeBusinessLicense(businessLicenseNames);

    let registration = await VendorRegistration.findOne({ userId: req.user.id });
    if (!registration) {
      registration = new VendorRegistration({ userId: req.user.id });
    }

    registration.companyName = companyName.trim();
    registration.taxId = taxId.trim();
    registration.companyAddress = companyAddress.trim();
    registration.businessLicense = normalizedLicense;
    registration.businessLicenseNames = normalizedLicenseNames;
    registration.phone = phone?.trim() || '';
    registration.email = email?.trim().toLowerCase() || '';
    registration.website = website?.trim() || '';
    registration.bio = bio?.trim() || '';
    registration.avatar = avatar || '';
    registration.accountHolderName = accountHolderName?.trim() || '';
    registration.accountNumber = accountNumber?.trim() || '';
    registration.bankName = bankName?.trim() || '';
    registration.verificationStatus = 'pending';

    await registration.save();

    // Sync shared fields to Vendor (create if not exists)
    let vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      vendor = new Vendor({ userId: req.user.id });
    }

    vendor.companyName = companyName.trim();
    vendor.taxId = taxId.trim();
    vendor.businessLicense = normalizedLicense;
    vendor.businessLicenseNames = normalizedLicenseNames;
    vendor.accountHolderName = accountHolderName?.trim() || '';
    vendor.accountNumber = accountNumber?.trim() || '';
    vendor.bankName = bankName?.trim() || '';
    vendor.registrationId = registration._id;

    vendor.companyAddress = companyAddress.trim();
    vendor.phone = phone?.trim() || '';
    vendor.email = email?.trim().toLowerCase() || '';
    vendor.website = website?.trim() || '';
    vendor.bio = bio?.trim() || '';
    vendor.avatar = avatar || '';

    vendor.verificationStatus = 'pending';
    vendor.isVerified = false;

    await vendor.save();

    // Notify all admins about new registration
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'new_vendor_registration',
          'Yêu cầu duyệt vendor mới',
          `${companyName.trim()} đã gửi yêu cầu đăng ký doanh nghiệp.`
        );
      }
    } catch (_err) {
      // non-fatal
    }

    res.status(200).json({
      message: 'Gửi thông tin doanh nghiệp thành công! Chúng tôi sẽ xem xét trong 2-3 ngày làm việc.',
      vendor: {
        id: registration._id,
        companyName: registration.companyName,
        verificationStatus: registration.verificationStatus,
        taxId: registration.taxId,
        companyAddress: registration.companyAddress,
        businessLicense: registration.businessLicense,
        businessLicenseNames: registration.businessLicenseNames || [],
        accountHolderName: registration.accountHolderName || '',
        accountNumber: registration.accountNumber || '',
        bankName: registration.bankName || '',
      },
    });
  } catch (error) {
    console.error('Submit vendor info error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getVendorRegistrationInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const registration = await VendorRegistration.findOne({ userId: req.user.id });
    if (!registration) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ đăng ký.' });
      return;
    }

    res.status(200).json({ vendor: registration });
  } catch (error) {
    console.error('Get vendor registration info error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const updateVendorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const { companyAddress, phone, email, website, bio, avatar } = req.body;

    let vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    if (companyAddress !== undefined) vendor.companyAddress = companyAddress?.trim() || '';
    if (phone !== undefined) {
      const digits = String(phone).replace(/\D/g, '');
      if (digits.length !== 10) {
        res.status(400).json({ message: 'Số điện thoại phải gồm 10 chữ số.' });
        return;
      }
      vendor.phone = phone?.trim() || '';
    }
    if (email !== undefined) {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(String(email).toLowerCase())) {
        res.status(400).json({ message: 'Email không hợp lệ.' });
        return;
      }
      vendor.email = email?.trim().toLowerCase() || '';
    }
    if (website !== undefined) vendor.website = website?.trim() || '';
    if (bio !== undefined) vendor.bio = bio?.trim() || '';
    if (avatar !== undefined) vendor.avatar = avatar || '';

    await vendor.save();

    res.status(200).json({ message: 'Cập nhật hồ sơ thành công', vendor });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getVendorInfo = async (req: AuthRequest, res: Response): Promise<void> => {
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

    res.status(200).json({ vendor });
  } catch (error) {
    console.error('Get vendor info error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const blockDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }

    const { date } = req.body;
    if (!date) { res.status(400).json({ message: 'Vui lòng cung cấp ngày cần block.' }); return; }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) { res.status(400).json({ message: 'Ngày không hợp lệ.' }); return; }

    parsedDate.setHours(0, 0, 0, 0);

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) { res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' }); return; }

    const blockedDates = (vendor.blockedDates as Date[]) || [];
    const alreadyBlocked = blockedDates.some(d => new Date(d).toDateString() === parsedDate.toDateString());
    if (alreadyBlocked) { res.status(400).json({ message: 'Ngày này đã được block.' }); return; }

    blockedDates.push(parsedDate);
    vendor.blockedDates = blockedDates;
    await vendor.save();

    res.status(200).json({ message: 'Block ngày thành công.', blockedDates: vendor.blockedDates });
  } catch (error) {
    console.error('Block date error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const unblockDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }

    const { date } = req.body;
    if (!date) { res.status(400).json({ message: 'Vui lòng cung cấp ngày cần bỏ block.' }); return; }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) { res.status(400).json({ message: 'Ngày không hợp lệ.' }); return; }

    parsedDate.setHours(0, 0, 0, 0);

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) { res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' }); return; }

    const filtered = (vendor.blockedDates || []).filter(d => new Date(d).toDateString() !== parsedDate.toDateString());
    vendor.blockedDates = filtered;
    await vendor.save();

    res.status(200).json({ message: 'Bỏ block ngày thành công.', blockedDates: vendor.blockedDates });
  } catch (error) {
    console.error('Unblock date error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const getVendorStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) { res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' }); return; }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalBookings, monthlyBookings, lastMonthBookings, pendingBookings, confirmedBookings, completedBookings] = await Promise.all([
      Booking.countDocuments({ vendorId: vendor._id }),
      Booking.countDocuments({ vendorId: vendor._id, createdAt: { $gte: firstDayOfMonth } }),
      Booking.countDocuments({ vendorId: vendor._id, createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } }),
      Booking.countDocuments({ vendorId: vendor._id, status: 'pending' }),
      Booking.countDocuments({ vendorId: vendor._id, status: 'confirmed' }),
      Booking.countDocuments({ vendorId: vendor._id, status: 'completed' })
    ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { vendorId: vendor._id, paymentStatus: { $in: ['deposit_paid', 'final_paid'] } } },
      { $group: { _id: null, total: { $sum: '$depositAmount' } } }
    ]);

    const monthlyRevenueAgg = await Booking.aggregate([
      { $match: { vendorId: vendor._id, paymentStatus: { $in: ['deposit_paid', 'final_paid'] }, createdAt: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: '$depositAmount' } } }
    ]);

    res.status(200).json({
      stats: {
        totalBookings, monthlyBookings, lastMonthBookings, pendingBookings, confirmedBookings, completedBookings,
        totalRevenue: revenueAgg[0]?.total || 0,
        monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
        averageRating: vendor.averageRating,
        reviewCount: vendor.reviewCount
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
