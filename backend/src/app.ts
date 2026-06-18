import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import vendorRoutes from './routes/vendor.routes';
import subscriptionRoutes from './routes/subscription.routes';
import packageRoutes from './routes/package.routes';
import boothRoutes from './routes/booth.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import postRoutes from './routes/post.routes';
import notificationRoutes from './routes/notification.routes';
import complaintRoutes from './routes/complaint.routes';

// exploreRoutes will be loaded dynamically to avoid crashing the dev server when files are being edited
let exploreRoutes: any = null;
try {
  // Use require so ts-node-dev can resolve the module reliably during restarts
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  exploreRoutes = require('./routes/explore.routes').default;
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Warning: /routes/explore.routes not available yet. /api/explore disabled until present.');
}

const app: Express = express();

// UC-47: Rate Limiting — chỉ áp dụng cho auth endpoints nhạy cảm
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.' }
});

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Auth Routes (with stricter rate limit)
app.use('/api/auth', authLimiter, authRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Vendor Routes
app.use('/api/vendor', vendorRoutes);

// Subscription Routes
app.use('/api/subscription', subscriptionRoutes);

// Package Routes
app.use('/api/packages', packageRoutes);

// Booth Routes
app.use('/api/booths', boothRoutes);

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// Payment Routes
app.use('/api/payment', paymentRoutes);

// Review Routes
app.use('/api/reviews', reviewRoutes);

// Post Routes
app.use('/api/posts', postRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Complaint Routes
app.use('/api/complaints', complaintRoutes);

// Public Explore Routes (mounted only when available)
if (exploreRoutes) {
  app.use('/api/explore', exploreRoutes);
}

// Default Route
app.get('/', (_req, res) => {
  res.send('ClickPick API is running...');
});

// UC-48: Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Lỗi hệ thống. Vui lòng thử lại sau.';
  res.status(statusCode).json({ message });
});

export default app;
