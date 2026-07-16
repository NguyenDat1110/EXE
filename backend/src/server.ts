import dotenv from 'dotenv';

// Load environment variables (phải chạy trước khi import các module dùng process.env)
dotenv.config();

import app from './app';
import connectDB from './config/db';
import { registerPayOSWebhook } from './services/payos.service';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Đăng ký webhook PayOS (nếu có PAYOS_WEBHOOK_URL, ví dụ URL ngrok)
    registerPayOSWebhook();
  });
};

startServer();
