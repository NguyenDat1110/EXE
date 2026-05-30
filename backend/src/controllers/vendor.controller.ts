import { Request, Response } from 'express';
import { Vendor } from '../models/vendor.model';
import { AuthRequest } from '../middleware/auth.middleware';

// UC-09: Vendor submit thông tin doanh nghiệp để admin duyệt
export const submitVendorInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const { companyName, taxId, companyAddress, businessLicense, phone, email, website, bio, avatar } = req.body;

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
    const oldBusinessLicense = vendor.businessLicense || '';

    // Update vendor info
    vendor.companyName = companyName.trim();
    vendor.taxId = taxId.trim();
    vendor.companyAddress = companyAddress.trim();
    vendor.businessLicense = businessLicense.trim();
    vendor.phone = phone?.trim() || vendor.phone;
    vendor.email = email?.trim() || vendor.email;
    vendor.website = website?.trim() || '';
    vendor.bio = bio?.trim() || '';
    vendor.avatar = avatar || '';

    // Only mark as pending if core identity fields changed that require re-verification
    const identityChanged = (
      (companyName && companyName.trim() !== oldCompanyName) ||
      (taxId && taxId.trim() !== oldTaxId) ||
      (companyAddress && companyAddress.trim() !== oldCompanyAddress) ||
      (businessLicense && businessLicense.trim() !== oldBusinessLicense)
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
        companyAddress: vendor.companyAddress
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
