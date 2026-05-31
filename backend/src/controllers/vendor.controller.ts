import { Request, Response } from 'express';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { Vendor } from '../models/vendor.model';
import { AuthRequest } from '../middleware/auth.middleware';

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
      // Treat plain string values as a single uploaded document URL.
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

// UC-09: Vendor submit thông tin doanh nghiệp để admin duyệt
export const submitVendorInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const { companyName, taxId, companyAddress, businessLicense, businessLicenseNames, phone, email, website, bio, avatar,
      accountHolderName, accountNumber, bankName } = req.body;

    // Validate required fields (businessLicense is optional for testing)
    if (!companyName || !taxId || !companyAddress) {
      res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin doanh nghiệp.' });
      return;
    }

    // Find vendor by userId
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ vendor.' });
      return;
    }

    // Preserve old identity fields to detect changes
    const oldCompanyName = vendor.companyName || '';
    const oldTaxId = vendor.taxId || '';
    const oldCompanyAddress = vendor.companyAddress || '';
    const oldBusinessLicense = normalizeBusinessLicense(vendor.businessLicense);
    const nextBusinessLicense = normalizeBusinessLicense(businessLicense);
    const nextBusinessLicenseNames = normalizeBusinessLicense(businessLicenseNames);

    // Update vendor info
    vendor.companyName = companyName.trim();
    vendor.taxId = taxId.trim();
    vendor.companyAddress = companyAddress.trim();
    vendor.businessLicense = nextBusinessLicense.length > 0 ? nextBusinessLicense : oldBusinessLicense;
    vendor.businessLicenseNames = nextBusinessLicenseNames.length > 0 ? nextBusinessLicenseNames : vendor.businessLicenseNames || [];
    vendor.phone = phone?.trim() || vendor.phone;
    vendor.email = email?.trim() || vendor.email;
    vendor.website = website?.trim() || '';
    vendor.bio = bio?.trim() || '';
    vendor.avatar = avatar || '';
    vendor.accountHolderName = accountHolderName?.trim() || vendor.accountHolderName || '';
    vendor.accountNumber = accountNumber?.trim() || vendor.accountNumber || '';
    vendor.bankName = bankName?.trim() || vendor.bankName || '';

    // Only mark as pending if core identity fields changed that require re-verification
    const identityChanged = (
      (companyName && companyName.trim() !== oldCompanyName) ||
      (taxId && taxId.trim() !== oldTaxId) ||
      (companyAddress && companyAddress.trim() !== oldCompanyAddress) ||
      JSON.stringify(nextBusinessLicense) !== JSON.stringify(oldBusinessLicense)
    );

    if (identityChanged) {
      vendor.verificationStatus = 'pending';
    }

    await vendor.save();

    res.status(200).json({
      message: 'Gửi thông tin doanh nghiệp thành công! Chúng tôi sẽ xem xét trong 2-3 ngày làm việc.',
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        verificationStatus: vendor.verificationStatus,
        taxId: vendor.taxId,
        companyAddress: vendor.companyAddress,
        businessLicense: vendor.businessLicense,
        businessLicenseNames: vendor.businessLicenseNames || [],
        accountHolderName: vendor.accountHolderName || '',
        accountNumber: vendor.accountNumber || '',
        bankName: vendor.bankName || ''
      }
    });
  } catch (error) {
    console.error('Submit vendor info error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Get vendor info
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
