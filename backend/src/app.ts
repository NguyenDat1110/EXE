import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import vendorRoutes from './routes/vendor.routes';
import subscriptionRoutes from './routes/subscription.routes';
import packageRoutes from './routes/package.routes';
import boothRoutes from './routes/booth.routes';

const app: Express = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Default Route
app.get('/', (req, res) => {
  res.send('ClickPick API is running...');
});

export default app;
