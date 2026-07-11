import PayOS from '@payos/node';

let client: PayOS | null = null;

export const isPayOSConfigured = (): boolean => {
  return Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY);
};

export const getPayOS = (): PayOS => {
  if (!client) {
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error('PayOS chưa được cấu hình. Vui lòng điền PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong file .env');
    }

    client = new PayOS(clientId, apiKey, checksumKey);
  }
  return client;
};

// orderCode của PayOS là số nguyên dương, tối đa 9007199254740991.
// Date.now() (13 chữ số) + 3 số ngẫu nhiên = 16 chữ số bắt đầu bằng 1 → vẫn trong giới hạn an toàn.
export const generateOrderCode = (): number => {
  return Number(`${Date.now()}${Math.floor(100 + Math.random() * 900)}`);
};

// Đăng ký webhook URL với PayOS khi khởi động server (dùng cho ngrok khi chạy local).
// Đặt PAYOS_WEBHOOK_URL=https://<ten-mien-ngrok>/api/payment/payos-webhook trong .env
export const registerPayOSWebhook = async (): Promise<void> => {
  const webhookUrl = process.env.PAYOS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[PayOS] PAYOS_WEBHOOK_URL chưa được cấu hình - bỏ qua đăng ký webhook.');
    return;
  }
  if (!isPayOSConfigured()) {
    console.log('[PayOS] Thiếu PAYOS_CLIENT_ID/API_KEY/CHECKSUM_KEY - bỏ qua đăng ký webhook.');
    return;
  }

  try {
    await getPayOS().confirmWebhook(webhookUrl);
    console.log(`[PayOS] Đã đăng ký webhook thành công: ${webhookUrl}`);
  } catch (error) {
    console.error('[PayOS] Đăng ký webhook thất bại. Kiểm tra lại URL ngrok và cấu hình PayOS:', error);
  }
};
