import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
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

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Auth Routes
app.use('/api/auth', authRoutes);

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

// Public Explore Routes (mounted only when available)
if (exploreRoutes) {
  app.use('/api/explore', exploreRoutes);
}

// Default Route
app.get('/', (req, res) => {
  res.send('ClickPick API is running...');
});

export default app;
