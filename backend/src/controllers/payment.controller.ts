import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Booking } from '../models/booking.model';
import { Payment, IPayment } from '../models/payment.model';
import { Vendor } from '../models/vendor.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { getPayOS, generateOrderCode } from '../services/payos.service';
import { activateVendorSubscription } from './subscription.controller';
import { SubscriptionPlan } from '../models/subscriptionPlan.model';
import { createNotification } from './notification.controller';
import { sendDepositConfirmedEmail } from '../services/email.service';

const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const shortBookingCode = (bookingId: unknown): string => String(bookingId).slice(-6).toUpperCase();

// Tạo link thanh toán PayOS và lưu bản ghi Payment tương ứng
const createPayOSPayment = async (params: {
  type: IPayment['type'];
  amount: number;
  description: string;
  userId: string;
  bookingId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  subscriptionPlan?: string;
}): Promise<IPayment> => {
  const orderCode = generateOrderCode();

  const paymentLink = await getPayOS().createPaymentLink({
    orderCode,
    amount: params.amount,
    description: params.description, // PayOS giới hạn 25 ký tự
    returnUrl: `${FRONTEND_URL()}/payment/result`,
    cancelUrl: `${FRONTEND_URL()}/payment/result`
  });

  const payment = await Payment.create({
    orderCode,
    type: params.type,
    amount: params.amount,
    status: 'pending',
    userId: new Types.ObjectId(params.userId),
    bookingId: params.bookingId,
    vendorId: params.vendorId,
    subscriptionPlan: params.subscriptionPlan,
    description: params.description,
    checkoutUrl: paymentLink.checkoutUrl,
    paymentLinkId: paymentLink.paymentLinkId
  });

  return payment;
};

// Xử lý sau khi thanh toán thành công (gọi từ webhook hoặc khi đồng bộ trạng thái)
const fulfillPayment = async (payment: IPayment): Promise<void> => {
  if (payment.status === 'paid') return;

  if (payment.type === 'booking_deposit') {
    const booking = await Booking.findById(payment.bookingId);
    if (!booking) throw new Error(`Booking ${payment.bookingId} not found for payment ${payment.orderCode}`);

    if (booking.paymentStatus !== 'deposit_paid' && booking.paymentStatus !== 'final_paid') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'deposit_paid';
      booking.depositPaidAt = new Date();
      await booking.save();

      // Thông báo cho khách hàng và vendor
      try {
        const customerUser = await User.findById(booking.customerId).select('email name').lean() as any;
        const vendorRecord = await Vendor.findById(booking.vendorId).select('email companyName userId').lean() as any;
        await createNotification(String(booking.customerId), 'deposit_confirmed', 'Thanh toán cọc thành công', 'Bạn đã thanh toán cọc qua PayOS. Booking đã được xác nhận!', String(booking._id), 'Booking');
        if (vendorRecord?.userId) {
          await createNotification(String(vendorRecord.userId), 'deposit_confirmed', 'Khách hàng đã thanh toán cọc', `${customerUser?.name || 'Khách hàng'} đã thanh toán cọc qua PayOS. Booking đã được xác nhận.`, String(booking._id), 'Booking');
        }
        if (customerUser?.email && vendorRecord) {
          sendDepositConfirmedEmail(customerUser.email, customerUser.name, vendorRecord.companyName, booking.eventDate?.toLocaleDateString('vi-VN') || '').catch(console.error);
        }
      } catch (notifyErr) {
        console.error('[PayOS] Notify deposit paid error:', notifyErr);
      }
    }
  } else if (payment.type === 'booking_final') {
    const booking = await Booking.findById(payment.bookingId);
    if (!booking) throw new Error(`Booking ${payment.bookingId} not found for payment ${payment.orderCode}`);

    if (booking.paymentStatus !== 'final_paid') {
      booking.status = 'completed';
      booking.paymentStatus = 'final_paid';
      booking.finalPaidAt = new Date();
      await booking.save();

      try {
        const vendorRecord = await Vendor.findById(booking.vendorId).select('companyName userId').lean() as any;
        await createNotification(String(booking.customerId), 'booking_completed', 'Thanh toán hoàn tất', 'Bạn đã thanh toán phần còn lại qua PayOS. Đơn đã hoàn tất!', String(booking._id), 'Booking');
        if (vendorRecord?.userId) {
          await createNotification(String(vendorRecord.userId), 'booking_completed', 'Khách hàng đã thanh toán phần còn lại', 'Khách hàng đã thanh toán phần còn lại qua PayOS. Đơn đã hoàn tất.', String(booking._id), 'Booking');
        }
      } catch (notifyErr) {
        console.error('[PayOS] Notify final paid error:', notifyErr);
      }
    }
  } else if (payment.type === 'subscription') {
    if (!payment.vendorId || !payment.subscriptionPlan) {
      throw new Error(`Payment ${payment.orderCode} missing vendor/plan info`);
    }
    await activateVendorSubscription(payment.vendorId, payment.subscriptionPlan);

    try {
      const planDoc = await SubscriptionPlan.findOne({ $or: [{ code: payment.subscriptionPlan }, { type: payment.subscriptionPlan }] }).lean();
      const planName = planDoc?.name || payment.subscriptionPlan;
      await createNotification(String(payment.userId), 'system', 'Nâng cấp gói thành công', `Bạn đã thanh toán và kích hoạt ${planName} thành công.`, String(payment.vendorId), 'Vendor');
    } catch (notifyErr) {
      console.error('[PayOS] Notify subscription error:', notifyErr);
    }
  }

  payment.status = 'paid';
  payment.paidAt = new Date();
  await payment.save();

  console.log(`[PayOS] Payment ${payment.orderCode} (${payment.type}) fulfilled successfully`);
};

// POST /api/payment/booking/:id/deposit — tạo link thanh toán cọc
export const createBookingDepositPayment = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!['pending', 'waiting_deposit'].includes(booking.status)) {
      res.status(400).json({ message: 'Booking hiện không thể thanh toán cọc.' });
      return;
    }

    if (booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'final_paid') {
      res.status(400).json({ message: 'Booking đã được thanh toán cọc.' });
      return;
    }

    const amount = Math.round(booking.depositAmount || 0);
    if (amount <= 0) {
      res.status(400).json({ message: 'Số tiền cọc không hợp lệ.' });
      return;
    }

    // Tái sử dụng link thanh toán đang chờ nếu có (tránh tạo trùng)
    const existing = await Payment.findOne({ bookingId: booking._id, type: 'booking_deposit', status: 'pending', amount });
    if (existing?.checkoutUrl) {
      res.status(200).json({ checkoutUrl: existing.checkoutUrl, orderCode: existing.orderCode, amount });
      return;
    }

    const payment = await createPayOSPayment({
      type: 'booking_deposit',
      amount,
      description: `COC ${shortBookingCode(booking._id)}`,
      userId: req.user.id,
      bookingId: booking._id as Types.ObjectId,
      vendorId: booking.vendorId
    });

    res.status(200).json({ checkoutUrl: payment.checkoutUrl, orderCode: payment.orderCode, amount });
  } catch (error) {
    console.error('Create deposit payment error:', error);
    res.status(500).json({ message: 'Không thể tạo link thanh toán. Vui lòng thử lại sau.' });
  }
};

// POST /api/payment/booking/:id/final — tạo link thanh toán phần còn lại
export const createBookingFinalPayment = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (booking.paymentStatus === 'final_paid') {
      res.status(400).json({ message: 'Booking đã được thanh toán đầy đủ.' });
      return;
    }

    const amount = Math.round(booking.remainingAmount || Math.max((booking.totalPrice || 0) - (booking.depositAmount || 0), 0));
    if (amount <= 0) {
      res.status(400).json({ message: 'Số tiền thanh toán không hợp lệ.' });
      return;
    }

    const existing = await Payment.findOne({ bookingId: booking._id, type: 'booking_final', status: 'pending', amount });
    if (existing?.checkoutUrl) {
      res.status(200).json({ checkoutUrl: existing.checkoutUrl, orderCode: existing.orderCode, amount });
      return;
    }

    const payment = await createPayOSPayment({
      type: 'booking_final',
      amount,
      description: `CONLAI ${shortBookingCode(booking._id)}`,
      userId: req.user.id,
      bookingId: booking._id as Types.ObjectId,
      vendorId: booking.vendorId
    });

    res.status(200).json({ checkoutUrl: payment.checkoutUrl, orderCode: payment.orderCode, amount });
  } catch (error) {
    console.error('Create final payment error:', error);
    res.status(500).json({ message: 'Không thể tạo link thanh toán. Vui lòng thử lại sau.' });
  }
};

// POST /api/payment/subscription — tạo link thanh toán nâng cấp gói vendor
export const createSubscriptionPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    if (req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể mua gói dịch vụ.' });
      return;
    }

    const plan = String(req.body?.plan || '');
    if (!plan) {
      res.status(400).json({ message: 'Gói dịch vụ không hợp lệ.' });
      return;
    }

    const planDoc = await SubscriptionPlan.findOne({ code: plan, isActive: true }).lean();
    if (!planDoc) {
      res.status(400).json({ message: 'Gói dịch vụ không tồn tại.' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ doanh nghiệp.' });
      return;
    }

    if (vendor.verificationStatus !== 'approved') {
      res.status(403).json({ message: 'Hồ sơ doanh nghiệp chưa được phê duyệt. Không thể mua gói.' });
      return;
    }

    const now = new Date();
    if (vendor.subscriptionStatus === 'active' && vendor.subscriptionExpiry && vendor.subscriptionExpiry > now && vendor.subscriptionPlan === plan) {
      res.status(400).json({ message: 'Bạn đã có gói này đang hoạt động. Không thể mua lại trước khi hết hạn.' });
      return;
    }

    // Gói miễn phí: kích hoạt trực tiếp, không cần thanh toán
    if (planDoc.price <= 0) {
      const updatedVendor = await activateVendorSubscription(vendor._id, planDoc.code);
      res.status(200).json({
        activated: true,
        vendor: {
          subscriptionPlan: updatedVendor.subscriptionPlan,
          subscriptionExpiry: updatedVendor.subscriptionExpiry,
          subscriptionStatus: updatedVendor.subscriptionStatus
        }
      });
      return;
    }

    const amount = Math.round(planDoc.price);

    const existing = await Payment.findOne({ vendorId: vendor._id, type: 'subscription', subscriptionPlan: plan, status: 'pending', amount });
    if (existing?.checkoutUrl) {
      res.status(200).json({ checkoutUrl: existing.checkoutUrl, orderCode: existing.orderCode, amount });
      return;
    }

    const payment = await createPayOSPayment({
      type: 'subscription',
      amount,
      description: `GOI ${plan.toUpperCase()}`,
      userId: req.user.id,
      vendorId: vendor._id as Types.ObjectId,
      subscriptionPlan: plan
    });

    res.status(200).json({ checkoutUrl: payment.checkoutUrl, orderCode: payment.orderCode, amount });
  } catch (error) {
    console.error('Create subscription payment error:', error);
    res.status(500).json({ message: 'Không thể tạo link thanh toán. Vui lòng thử lại sau.' });
  }
};

// POST /api/payment/payos-webhook — PayOS gọi khi có giao dịch (cần ngrok khi chạy local)
export const handlePayOSWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    let webhookData;
    try {
      webhookData = getPayOS().verifyPaymentWebhookData(req.body);
    } catch (verifyError) {
      // Request test khi đăng ký webhook hoặc chữ ký không hợp lệ — trả 200 để PayOS xác nhận được URL
      console.warn('[PayOS] Webhook signature verification failed (có thể là request test):', verifyError);
      res.status(200).json({ success: true });
      return;
    }

    if (!webhookData) {
      res.status(200).json({ success: true, message: 'No data' });
      return;
    }

    // code '00' = giao dịch thành công
    if (webhookData.code !== '00') {
      console.log(`[PayOS] Webhook nhận giao dịch không thành công (code=${webhookData.code}), bỏ qua.`);
      res.status(200).json({ success: true, message: 'Ignored unsuccessful transaction' });
      return;
    }

    const payment = await Payment.findOne({ orderCode: webhookData.orderCode });
    if (!payment) {
      // PayOS gửi orderCode test (123) khi xác thực webhook URL
      console.log(`[PayOS] Không tìm thấy payment với orderCode=${webhookData.orderCode} (có thể là webhook test).`);
      res.status(200).json({ success: true, message: 'Payment not found' });
      return;
    }

    if (payment.status === 'paid') {
      res.status(200).json({ success: true, message: 'Already processed' });
      return;
    }

    if (Number(webhookData.amount) < payment.amount) {
      console.warn(`[PayOS] Số tiền webhook (${webhookData.amount}) nhỏ hơn số tiền cần thanh toán (${payment.amount}) cho orderCode=${payment.orderCode}`);
      res.status(200).json({ success: true, message: 'Amount mismatch, ignored' });
      return;
    }

    await fulfillPayment(payment);

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('PayOS Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/payment/status/:orderCode — FE kiểm tra trạng thái sau khi quay về từ PayOS.
// Nếu payment vẫn pending thì đồng bộ trực tiếp từ PayOS (dự phòng khi webhook chưa kịp về).
export const getPaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }

    const orderCode = Number(req.params.orderCode);
    if (!orderCode || Number.isNaN(orderCode)) {
      res.status(400).json({ message: 'Mã đơn thanh toán không hợp lệ.' });
      return;
    }

    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      res.status(404).json({ message: 'Không tìm thấy giao dịch.' });
      return;
    }

    if (String(payment.userId) !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền xem giao dịch này.' });
      return;
    }

    if (payment.status === 'pending') {
      try {
        const info = await getPayOS().getPaymentLinkInformation(orderCode);
        if (info.status === 'PAID') {
          await fulfillPayment(payment);
        } else if (info.status === 'CANCELLED' || info.status === 'EXPIRED') {
          payment.status = 'cancelled';
          await payment.save();
        }
      } catch (syncError) {
        console.error('[PayOS] Sync payment status error:', syncError);
      }
    }

    res.status(200).json({
      orderCode: payment.orderCode,
      type: payment.type,
      status: payment.status,
      amount: payment.amount,
      bookingId: payment.bookingId || null,
      subscriptionPlan: payment.subscriptionPlan || null,
      paidAt: payment.paidAt || null
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
