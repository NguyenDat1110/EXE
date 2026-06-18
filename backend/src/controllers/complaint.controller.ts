import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Complaint } from '../models/complaint.model';

// UC-40: Customer gửi khiếu nại
export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }

    const { subject, description, vendorId, bookingId } = req.body;
    if (!subject?.trim() || !description?.trim()) {
      res.status(400).json({ message: 'Tiêu đề và nội dung khiếu nại là bắt buộc.' });
      return;
    }

    const complaint = await Complaint.create({
      customerId: new Types.ObjectId(req.user.id),
      subject: subject.trim(),
      description: description.trim(),
      vendorId: vendorId && Types.ObjectId.isValid(vendorId) ? new Types.ObjectId(vendorId) : undefined,
      bookingId: bookingId && Types.ObjectId.isValid(bookingId) ? new Types.ObjectId(bookingId) : undefined
    });

    res.status(201).json({ message: 'Gửi khiếu nại thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.', complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// UC-40: Customer xem khiếu nại của mình
export const getMyComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }

    const complaints = await Complaint.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('bookingId', 'eventDate status')
      .lean();

    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// UC-40: Admin lấy danh sách khiếu nại
export const adminGetComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Chỉ admin mới có quyền.' }); return; }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('customerId', 'name email')
        .populate('bookingId', 'eventDate status')
        .lean(),
      Complaint.countDocuments(filter)
    ]);

    res.status(200).json({ complaints, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error('Admin get complaints error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// UC-40: Admin xử lý khiếu nại
export const adminUpdateComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Chỉ admin mới có quyền.' }); return; }

    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!Types.ObjectId.isValid(id)) { res.status(400).json({ message: 'ID không hợp lệ.' }); return; }

    const validStatuses = ['in_review', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
      return;
    }

    const update: any = { status };
    if (adminNote) update.adminNote = adminNote.trim();
    if (status === 'resolved') update.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(id, update, { new: true });
    if (!complaint) { res.status(404).json({ message: 'Không tìm thấy khiếu nại.' }); return; }

    res.status(200).json({ message: 'Cập nhật khiếu nại thành công.', complaint });
  } catch (error) {
    console.error('Admin update complaint error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
