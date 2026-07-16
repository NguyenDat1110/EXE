import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Booth } from '../models/booth.model';
import { Package } from '../models/package.model';
import { Vendor } from '../models/vendor.model';

type CategorySlug = 'birthday' | 'business';

const CATEGORY_TO_EVENT_TYPE: Record<CategorySlug, string> = {
  birthday: 'TIỆC SINH NHẬT',
  business: 'TIỆC DOANH NGHIỆP'
};

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  birthday: 'Sinh nhật',
  business: 'Doanh nghiệp'
};

const VALID_CATEGORIES: CategorySlug[] = ['birthday', 'business'];

const normalizeCategory = (value: unknown): CategorySlug | null => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  return VALID_CATEGORIES.includes(raw as CategorySlug) ? (raw as CategorySlug) : null;
};

const toObjectId = (value: unknown): Types.ObjectId | null => {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value;
  const raw = String(value);
  if (!Types.ObjectId.isValid(raw)) return null;
  return new Types.ObjectId(raw);
};

export const getExploreCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const counts = await Promise.all(
      VALID_CATEGORIES.map(async (category) => {
        const eventType = CATEGORY_TO_EVENT_TYPE[category];
        const count = await Booth.countDocuments({
          isActive: true,
          $or: [{ category }, { eventType }, { eventType: eventType === 'TIỆC SINH NHẬT' ? 'SINH NHẬT' : 'HỘI THẢO' }]
        });

        return {
          slug: category,
          label: CATEGORY_LABELS[category],
          count
        };
      })
    );

    res.status(200).json({ data: counts });
  } catch (error) {
    console.error('Get explore categories error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getBoothsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = normalizeCategory(req.query.category);
    if (!category) {
      res.status(400).json({ message: 'Loại sự kiện không hợp lệ.' });
      return;
    }

    const search = String(req.query.search || '').trim();
    const eventType = CATEGORY_TO_EVENT_TYPE[category];

    const baseFilter: any = {
      isActive: true,
      $or: [{ category }, { eventType }, { eventType: eventType === 'TIỆC SINH NHẬT' ? 'SINH NHẬT' : 'HỘI THẢO' }]
    };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      baseFilter.$and = [{ $or: [{ name: regex }, { description: regex }] }];
    }

    const booths = await Booth.find(baseFilter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'vendorId',
        model: Vendor,
        select: 'companyAddress averageRating reviewCount avatar'
      })
      .lean();

    const data = booths.map((booth: any) => {
      const vendor = booth.vendorId || {};
      return {
        _id: booth._id,
        name: booth.name || '',
        category,
        eventType: booth.eventType,
        description: booth.description || '',
        address: booth.address || vendor.companyAddress || '',
        coverImage: booth.coverImage || vendor.avatar || '',
        averageRating: typeof vendor.averageRating === 'number' ? vendor.averageRating : 0,
        reviewCount: typeof vendor.reviewCount === 'number' ? vendor.reviewCount : 0
      };
    });

    res.status(200).json({
      category,
      label: CATEGORY_LABELS[category],
      data
    });
  } catch (error) {
    console.error('Get booths by category error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getBoothDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boothId } = req.params;
    if (!Types.ObjectId.isValid(boothId)) {
      res.status(400).json({ message: 'Mã gian hàng không hợp lệ.' });
      return;
    }

    const booth = await Booth.findOne({ _id: boothId, isActive: true })
      .populate({
        path: 'vendorId',
        model: Vendor,
        select: 'companyName email phone avatar bio companyAddress averageRating reviewCount'
      })
      .lean();

    if (!booth) {
      res.status(404).json({ message: 'Không tìm thấy gian hàng.' });
      return;
    }

    const boothObjectId = toObjectId(booth._id);
    if (!boothObjectId) {
      res.status(400).json({ message: 'Mã gian hàng không hợp lệ.' });
      return;
    }

    const packages = await Package.find({ boothId: boothObjectId, isActive: true })
      .sort({ price: 1, createdAt: -1 })
      .lean();

    const vendor = booth.vendorId as any;

    res.status(200).json({
      vendor: {
        _id: vendor?._id,
        name: vendor?.companyName || '',
        email: vendor?.email || '',
        phone: vendor?.phone || '',
        avatar: vendor?.avatar || '',
        description: vendor?.bio || '',
        averageRating: typeof vendor?.averageRating === 'number' ? vendor.averageRating : 0,
        reviewCount: typeof vendor?.reviewCount === 'number' ? vendor.reviewCount : 0,
        address: vendor?.companyAddress || ''
      },
      booth: {
        _id: booth._id,
        name: booth.name || '',
        category: booth.category || null,
        eventType: booth.eventType,
        description: booth.description || '',
        address: booth.address || vendor?.companyAddress || '',
        coverImage: booth.coverImage || '',
        gallery: Array.isArray(booth.gallery) ? booth.gallery : []
      },
      packages: packages.map((pkg: any) => ({
        _id: pkg._id,
        name: pkg.name || '',
        price: Number(pkg.price || 0),
        depositAmount: Number(pkg.depositAmount || 0),
        minParticipants: Number(pkg.minParticipants || 0),
        maxParticipants: Number(pkg.maxParticipants || 0),
        serviceDuration: pkg.serviceDuration || '',
        description: pkg.description || '',
        images: Array.isArray(pkg.images) ? pkg.images : [],
        includedServices: Array.isArray(pkg.includedServices) ? pkg.includedServices : []
      }))
    });
  } catch (error) {
    console.error('Get booth detail error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getVendorFirstBooth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    if (!Types.ObjectId.isValid(vendorId)) {
      res.status(400).json({ message: 'Mã vendor không hợp lệ.' });
      return;
    }

    const booth = await Booth.findOne({ vendorId: new Types.ObjectId(vendorId), isActive: true }).lean();
    
    if (!booth) {
      res.status(404).json({ message: 'Vendor chưa có gian hàng nào.' });
      return;
    }

    res.status(200).json({ boothId: booth._id });
  } catch (error) {
    console.error('Get vendor first booth error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
