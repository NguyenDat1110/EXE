import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Booking } from '../models/booking.model';
import { Review } from '../models/review.model';
import { Vendor } from '../models/vendor.model';
import { createNotification } from './notification.controller';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã đặt chỗ không hợp lệ.' });
      return;
    }

    const parsedRating = Number(rating);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao.' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ.' });
      return;
    }

    // Check if the current user is the customer of the booking
    if (String(booking.customerId) !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền đánh giá đơn đặt chỗ này.' });
      return;
    }

    // Check if the booking is completed
    if (booking.status !== 'completed') {
      res.status(400).json({ message: 'Bạn chỉ có thể đánh giá sau khi đơn đã hoàn thành hoàn toàn.' });
      return;
    }

    // Check if booking has already been reviewed
    if (booking.isReviewed) {
      res.status(400).json({ message: 'Đơn đặt chỗ này đã được đánh giá trước đó.' });
      return;
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      // Sync flag in case it was out of sync
      booking.isReviewed = true;
      await booking.save();
      res.status(400).json({ message: 'Đơn đặt chỗ này đã được đánh giá trước đó.' });
      return;
    }

    // Create review
    const review = await Review.create({
      bookingId: booking._id,
      customerId: new Types.ObjectId(req.user.id),
      vendorId: booking.vendorId,
      rating: parsedRating,
      comment: String(comment || '').trim()
    });

    // Update booking flag
    booking.isReviewed = true;
    await booking.save();

    // Recalculate Vendor averageRating & reviewCount
    const allVendorReviews = await Review.find({ vendorId: booking.vendorId });
    const reviewCount = allVendorReviews.length;
    const totalRating = allVendorReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(2)) : 0;

    const vendorRecord = await Vendor.findByIdAndUpdate(
      booking.vendorId,
      { averageRating, reviewCount },
      { new: true }
    );

    if (vendorRecord) {
      await createNotification(
        String(vendorRecord.userId),
        'review_received',
        'Bạn nhận được đánh giá mới',
        `Khách hàng đã gửi đánh giá ${parsedRating} sao cho dịch vụ của bạn.`,
        String(review._id),
        'Review'
      );
    }

    // Populate customer details to return
    await review.populate({
      path: 'customerId',
      select: 'name avatar email'
    });

    res.status(201).json({
      message: 'Đánh giá dịch vụ thành công!',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getVendorReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;

    if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
      res.status(400).json({ message: 'Mã nhà cung cấp không hợp lệ.' });
      return;
    }

    const reviews = await Review.find({ vendorId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'customerId',
        select: 'name avatar'
      })
      .lean();

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getBookingReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: 'Mã đặt chỗ không hợp lệ.' });
      return;
    }

    const review = await Review.findOne({ bookingId })
      .populate({
        path: 'customerId',
        select: 'name avatar'
      })
      .lean();

    res.status(200).json({ review: review || null });
  } catch (error) {
    console.error('Get booking review error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-32: Vendor phản hồi đánh giá
export const replyToReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Không được phép.' }); return; }

    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || typeof reply !== 'string' || !reply.trim()) {
      res.status(400).json({ message: 'Nội dung phản hồi không được để trống.' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID đánh giá không hợp lệ.' });
      return;
    }

    const review = await Review.findById(id);
    if (!review) { res.status(404).json({ message: 'Không tìm thấy đánh giá.' }); return; }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor || String(vendor._id) !== String(review.vendorId)) {
      res.status(403).json({ message: 'Bạn không có quyền phản hồi đánh giá này.' });
      return;
    }

    if ((review as any).vendorReply) {
      res.status(400).json({ message: 'Bạn đã phản hồi đánh giá này rồi.' });
      return;
    }

    (review as any).vendorReply = reply.trim();
    (review as any).vendorRepliedAt = new Date();
    await review.save();

    await createNotification(
      String(review.customerId),
      'review_reply',
      'Vendor đã phản hồi đánh giá của bạn',
      `${vendor.companyName || 'Vendor'} đã phản hồi đánh giá bạn đã gửi.`,
      String(review._id),
      'Review'
    );

    res.status(200).json({ message: 'Phản hồi đánh giá thành công.', review });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
