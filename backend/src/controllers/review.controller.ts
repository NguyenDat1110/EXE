import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Booking } from '../models/booking.model';
import { Review } from '../models/review.model';
import { Vendor } from '../models/vendor.model';

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

    await Vendor.findByIdAndUpdate(booking.vendorId, {
      averageRating,
      reviewCount
    });

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
