import { Request, Response } from 'express';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Booking } from '../models/booking.model';
import { Package } from '../models/package.model';
import { Vendor } from '../models/vendor.model';
import { AuthRequest } from '../middleware/auth.middleware';

const toObjectId = (value: unknown): Types.ObjectId | null => {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value;
  const raw = String(value);
  if (!Types.ObjectId.isValid(raw)) return null;
  return new Types.ObjectId(raw);
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const toDateKey = (date: Date | string): string => {
  const parsed = new Date(date);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDateOnly = (value: string): Date | null => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const result = new Date(year, month - 1, day);
  if (Number.isNaN(result.getTime())) return null;
  result.setHours(0, 0, 0, 0);
  return result;
};

const parseDurationMinutes = (value?: string): number => {
  if (!value) return 0;
  const raw = String(value).trim();
  const match = raw.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;

  const amount = Number(match[1].replace(',', '.'));
  if (Number.isNaN(amount) || amount < 0) return 0;

  if (/(phút|minute|min)/i.test(raw)) {
    return Math.round(amount);
  }

  return Math.round(amount * 60);
};

const combineDateAndTime = (dateValue: unknown, timeValue: unknown): Date | null => {
  if (!dateValue || !timeValue) return null;
  const day = parseLocalDateOnly(String(dateValue));
  if (!day) return null;

  const timeParts = String(timeValue).split(':');
  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1] || '0');
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const result = new Date(day);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const getCompletionEligibleAt = (eventStartAt?: Date, durationMinutes = 0): Date | null => {
  if (!eventStartAt || !durationMinutes) return null;
  return new Date(new Date(eventStartAt).getTime() + durationMinutes * 60 * 1000);
};

const isEligibleForVendorComplete = (booking: any): boolean => {
  if (!booking?.eventStartAt) return false;
  const eligibleAt = getCompletionEligibleAt(new Date(booking.eventStartAt), Number(booking.serviceDurationMinutes || 0));
  return !!eligibleAt && new Date() >= eligibleAt;
};

const formatBooking = (booking: any) => {
  const packageData = booking.packageId && typeof booking.packageId === 'object' ? {
    _id: booking.packageId._id,
    name: booking.packageId.name,
    price: booking.packageId.price,
    depositAmount: booking.packageId.depositAmount,
    serviceDuration: booking.packageId.serviceDuration,
    includedServices: booking.packageId.includedServices || []
  } : null;

  const customerData = booking.customerId && typeof booking.customerId === 'object' ? {
    _id: booking.customerId._id,
    name: booking.customerId.name || '',
    email: booking.customerId.email || '',
    phone: booking.customerId.phone || ''
  } : { _id: booking.customerId };

  const vendorData = booking.vendorId && typeof booking.vendorId === 'object' ? {
    _id: booking.vendorId._id,
    name: booking.vendorId.companyName || booking.vendorId.name || '',
    accountHolderName: booking.vendorId.accountHolderName || '',
    accountNumber: booking.vendorId.accountNumber || '',
    bankName: booking.vendorId.bankName || ''
  } : null;

  const boothData = booking.boothId && typeof booking.boothId === 'object' ? {
    _id: booking.boothId._id,
    name: booking.boothId.name || ''
  } : null;

  const eventStartAt = booking.eventStartAt ? new Date(booking.eventStartAt) : null;
  const completionEligibleAt = getCompletionEligibleAt(eventStartAt || undefined, Number(booking.serviceDurationMinutes || 0));

  return {
    _id: booking._id,
    customerId: booking.customerId,
    customer: customerData,
    vendorId: booking.vendorId,
    vendor: vendorData,
    boothId: booking.boothId,
    booth: boothData,
    packageId: booking.packageId,
    package: packageData,
    eventDate: booking.eventDate,
    eventAddress: booking.eventAddress || '',
    startTime: booking.startTime || '',
    eventStartAt,
    completionEligibleAt,
    numberOfGuests: booking.numberOfGuests,
    specialRequests: booking.specialRequests,
    totalPrice: booking.totalPrice,
    depositAmount: booking.depositAmount || 0,
    remainingAmount: booking.remainingAmount || 0,
    serviceDurationMinutes: booking.serviceDurationMinutes || 0,
    depositReceiptUrl: booking.depositReceiptUrl || null,
    depositRejectedAt: booking.depositRejectedAt || null,
    depositRejectedReason: booking.depositRejectedReason || '',
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    depositPaidAt: booking.depositPaidAt || null,
    vendorCompletedAt: booking.vendorCompletedAt || null,
    customerCompletedAt: booking.customerCompletedAt || null,
    finalPaidAt: booking.finalPaidAt || null,
    finalReceiptUrl: booking.finalReceiptUrl || null,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
};

const sanitizeFilename = (fileName: string): string => {
  return fileName
    .normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '') || 'receipt';
};

const extensionFromMimeType = (mimeType: string, originalName: string): string => {
  const normalized = originalName.toLowerCase();
  if (normalized.endsWith('.pdf') || mimeType === 'application/pdf') return '.pdf';
  if (normalized.endsWith('.png') || mimeType === 'image/png') return '.png';
  if (normalized.endsWith('.webp') || mimeType === 'image/webp') return '.webp';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg') || mimeType === 'image/jpeg') return '.jpg';
  return '';
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const {
      vendorId,
      boothId,
      packageId,
      eventDate,
      startTime,
      eventAddress,
      numberOfGuests,
      specialRequests,
      totalPrice
    } = req.body;

    const packageObjectId = toObjectId(packageId);
    const vendorObjectId = toObjectId(vendorId);
    const boothObjectId = toObjectId(boothId);

    if (!packageObjectId) {
      res.status(400).json({ message: 'Gói dịch vụ không hợp lệ.' });
      return;
    }

    const pkg = await Package.findById(packageObjectId).lean();
    if (!pkg) {
      res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
      return;
    }

    const resolvedVendorId = vendorObjectId || toObjectId(pkg.vendorId);
    const resolvedBoothId = boothObjectId || toObjectId(pkg.boothId);
    if (!resolvedVendorId) {
      res.status(400).json({ message: 'Nhà cung cấp không hợp lệ.' });
      return;
    }

    if (!eventDate) {
      res.status(400).json({ message: 'Vui lòng chọn ngày tổ chức.' });
      return;
    }

    if (!startTime) {
      res.status(400).json({ message: 'Vui lòng chọn thời gian bắt đầu.' });
      return;
    }

    if (!String(eventAddress || '').trim()) {
      res.status(400).json({ message: 'Vui lòng nhập địa chỉ tổ chức sự kiện.' });
      return;
    }

    const parsedEventDate = parseLocalDateOnly(String(eventDate));
    if (!parsedEventDate) {
      res.status(400).json({ message: 'Ngày tổ chức không hợp lệ.' });
      return;
    }

    const bookingDate = startOfDay(parsedEventDate);
    const today = startOfDay(new Date());
    if (bookingDate < today) {
      res.status(400).json({ message: 'Ngày đặt lịch phải là ngày hôm nay hoặc sau.' });
      return;
    }

    const eventStartAt = combineDateAndTime(eventDate, startTime);
    if (!eventStartAt) {
      res.status(400).json({ message: 'Thời gian bắt đầu không hợp lệ.' });
      return;
    }

    if (eventStartAt.getTime() <= Date.now()) {
      res.status(400).json({ message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại.' });
      return;
    }

    const guests = Number(numberOfGuests);
    if (!guests || guests < 1) {
      res.status(400).json({ message: 'Số lượng khách không hợp lệ.' });
      return;
    }

    const requestedTotal = Number(totalPrice) || Number(pkg.price || 0);
    if (requestedTotal <= 0) {
      res.status(400).json({ message: 'Tổng chi phí không hợp lệ.' });
      return;
    }

    const depositAmount = Number(pkg.depositAmount || Math.round(requestedTotal * 0.3));
    const remainingAmount = Math.max(requestedTotal - depositAmount, 0);
    const serviceDurationMinutes = parseDurationMinutes(pkg.serviceDuration);

    const existingBooking = await Booking.findOne({
      vendorId: resolvedVendorId,
      eventDate: { $gte: bookingDate, $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000) },
      status: { $nin: ['cancelled'] }
    }).lean();

    if (existingBooking) {
      res.status(400).json({ message: 'Ngày này đã có đơn đặt trước. Vui lòng chọn ngày khác.' });
      return;
    }

    const booking = await Booking.create({
      customerId: new Types.ObjectId(req.user.id),
      vendorId: resolvedVendorId,
      boothId: resolvedBoothId,
      packageId: packageObjectId,
      eventDate: bookingDate,
      eventAddress: String(eventAddress).trim(),
      startTime: String(startTime).trim(),
      eventStartAt,
      numberOfGuests: guests,
      specialRequests: specialRequests || '',
      totalPrice: requestedTotal,
      depositAmount,
      remainingAmount,
      serviceDurationMinutes,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);
    res.status(201).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const filters: any = { customerId: new Types.ObjectId(req.user.id) };
    if (req.query.vendorId) {
      const vendorObjectId = toObjectId(req.query.vendorId);
      if (vendorObjectId) filters.vendorId = vendorObjectId;
    }
    if (req.query.boothId) {
      const boothObjectId = toObjectId(req.query.boothId);
      if (boothObjectId) filters.boothId = boothObjectId;
    }
    if (req.query.status) {
      filters.status = String(req.query.status);
    }

    const bookings = await Booking.find(filters)
      .sort({ createdAt: -1 })
      .populate('packageId vendorId boothId customerId')
      .lean();

    res.status(200).json({ bookings: bookings.map(formatBooking) });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const booking = await Booking.findById(bookingId).populate('packageId vendorId boothId customerId').lean();
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking.' });
      return;
    }

    const customerId = String(booking.customerId);
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ userId: userId }).lean();
    const isVendorOwner = vendor && String(vendor._id) === String(booking.vendorId);

    if (customerId !== userId && !isVendorOwner && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền truy cập booking này.' });
      return;
    }

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getVendorBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    if (req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể xem danh sách booking này.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id }).lean();
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy nhà cung cấp.' });
      return;
    }

    const filters: any = { vendorId: vendor._id };
    if (req.query.status) {
      filters.status = String(req.query.status);
    }

    const bookings = await Booking.find(filters)
      .sort({ createdAt: -1 })
      .populate('packageId boothId customerId')
      .lean();

    res.status(200).json({ bookings: bookings.map(formatBooking) });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getVendorAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.params.vendorId;
    const vendorObjectId = toObjectId(vendorId);
    if (!vendorObjectId) {
      res.status(400).json({ message: 'Nhà cung cấp không hợp lệ.' });
      return;
    }

    const bookings = await Booking.find({
      vendorId: vendorObjectId,
      status: { $nin: ['cancelled'] }
    }).lean();

    const blockedDates = bookings
      .map((booking) => booking.eventDate)
      .filter((date) => date)
      .map((date) => toDateKey(date));

    res.status(200).json({ blockedDates: Array.from(new Set(blockedDates)) });
  } catch (error) {
    console.error('Get vendor availability error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    if (req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể duyệt booking.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id }).lean();
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy nhà cung cấp.' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, vendorId: vendor._id });
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking phù hợp.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ message: 'Booking hiện không thể duyệt.' });
      return;
    }

    booking.status = 'waiting_deposit';
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const declineBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    if (req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể từ chối booking.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id }).lean();
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy nhà cung cấp.' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, vendorId: vendor._id });
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking phù hợp.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ message: 'Chỉ có thể từ chối booking đang chờ duyệt.' });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Decline booking error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking.' });
      return;
    }

    if (String(booking.customerId) !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ message: 'Chỉ có thể hủy khi booking đang chờ duyệt.' });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const payDeposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking.' });
      return;
    }

    if (String(booking.customerId) !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
      return;
    }

    if (booking.status !== 'waiting_deposit') {
      res.status(400).json({ message: 'Booking chưa được chấp nhận hoặc đã được xử lý.' });
      return;
    }

    // Handle optional receipt upload (req.file provided by multer)
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (file) {
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        res.status(400).json({ message: 'Chỉ hỗ trợ PDF, JPG, PNG và WEBP.' });
        return;
      }

      const uploadsDir = path.resolve(process.cwd(), 'uploads', 'receipts');
      await mkdir(uploadsDir, { recursive: true });

      const originalName = file.originalname || 'receipt';
      const safeBaseName = sanitizeFilename(originalName.replace(/\.[^.]+$/, ''));
      const extension = extensionFromMimeType(file.mimetype, originalName);
      const storedFileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
      const filePath = path.join(uploadsDir, storedFileName);

      await writeFile(filePath, file.buffer);

      const publicUrl = `${req.protocol}://${req.get('host')}/uploads/receipts/${storedFileName}`;
      booking.depositReceiptUrl = publicUrl;
    }

      // mark as pending deposit (customer uploaded receipt) - vendor must confirm
      booking.paymentStatus = 'deposit_pending';
      booking.depositRejectedReason = '';
      booking.depositRejectedAt = undefined;
      booking.status = 'waiting_deposit';
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Pay deposit error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

  export const vendorConfirmDeposit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Yêu cầu xác thực.' });
        return;
      }

      if (req.user.role !== 'vendor') {
        res.status(403).json({ message: 'Chỉ vendor mới có thể xác nhận thanh toán.' });
        return;
      }

      const bookingId = req.params.id;
      if (!Types.ObjectId.isValid(bookingId)) {
        res.status(400).json({ message: 'Mã booking không hợp lệ.' });
        return;
      }

      const vendor = await Vendor.findOne({ userId: req.user.id }).lean();
      if (!vendor) {
        res.status(404).json({ message: 'Không tìm thấy nhà cung cấp.' });
        return;
      }

      const booking = await Booking.findOne({ _id: bookingId, vendorId: vendor._id });
      if (!booking) {
        res.status(404).json({ message: 'Không tìm thấy booking phù hợp.' });
        return;
      }

      if (booking.paymentStatus !== 'deposit_pending') {
        res.status(400).json({ message: 'Không có biên lai cọc để xác nhận.' });
        return;
      }

      booking.paymentStatus = 'deposit_paid';
      booking.depositPaidAt = new Date();
      booking.status = 'confirmed';
      await booking.save();
      await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

      res.status(200).json({ booking: formatBooking(booking) });
    } catch (error) {
      console.error('Vendor confirm deposit error:', error);
      res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
    }
  };

export const vendorRejectDeposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    if (req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể từ chối biên lai.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const reason = String(req.body?.reason || '').trim();
    if (!reason) {
      res.status(400).json({ message: 'Vui lòng nhập lý do từ chối.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id }).lean();
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy nhà cung cấp.' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, vendorId: vendor._id });
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking phù hợp.' });
      return;
    }

    if (booking.paymentStatus !== 'deposit_pending') {
      res.status(400).json({ message: 'Không có biên lai cọc để từ chối.' });
      return;
    }

    booking.paymentStatus = 'deposit_rejected';
    booking.depositRejectedAt = new Date();
    booking.depositRejectedReason = reason;
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Vendor reject deposit error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
export const markVendorComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    if (req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể đánh dấu hoàn thành.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id }).lean();
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy nhà cung cấp.' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, vendorId: vendor._id });
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking phù hợp.' });
      return;
    }

    if (booking.status !== 'confirmed') {
      res.status(400).json({ message: 'Chỉ có thể đánh dấu hoàn thành với đơn đã được xác nhận cọc.' });
      return;
    }

    if (!isEligibleForVendorComplete(booking)) {
      res.status(400).json({ message: 'Chưa tới thời điểm hoàn thành đơn này.' });
      return;
    }

    booking.status = 'vendor_completed';
    booking.vendorCompletedAt = new Date();
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Vendor complete booking error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const confirmCustomerComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking.' });
      return;
    }

    if (String(booking.customerId) !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
      return;
    }

    if (booking.status !== 'vendor_completed') {
      res.status(400).json({ message: 'Chỉ có thể xác nhận hoàn thành sau khi vendor đánh dấu hoàn thành.' });
      return;
    }

    booking.status = 'customer_completed';
    booking.customerCompletedAt = new Date();
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Confirm customer complete error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const payFinalBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const bookingId = req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã booking không hợp lệ.' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy booking.' });
      return;
    }

    if (String(booking.customerId) !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
      return;
    }

    if (booking.status !== 'customer_completed') {
      res.status(400).json({ message: 'Chỉ có thể thanh toán phần còn lại sau khi bạn đã xác nhận hoàn thành.' });
      return;
    }

    // Handle optional receipt upload
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (file) {
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        res.status(400).json({ message: 'Chỉ hỗ trợ PDF, JPG, PNG và WEBP.' });
        return;
      }

      const uploadsDir = path.resolve(process.cwd(), 'uploads', 'receipts');
      await mkdir(uploadsDir, { recursive: true });

      const originalName = file.originalname || 'receipt';
      const safeBaseName = sanitizeFilename(originalName.replace(/\.[^.]+$/, ''));
      const extension = extensionFromMimeType(file.mimetype, originalName);
      const storedFileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
      const filePath = path.join(uploadsDir, storedFileName);

      await writeFile(filePath, file.buffer);

      const publicUrl = `${req.protocol}://${req.get('host')}/uploads/receipts/${storedFileName}`;
      booking.finalReceiptUrl = publicUrl;
    }

    booking.paymentStatus = 'final_paid';
    booking.finalPaidAt = new Date();
    booking.status = 'completed';
    await booking.save();
    await booking.populate(['packageId', 'vendorId', 'boothId', 'customerId']);

    res.status(200).json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error('Pay final balance error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
