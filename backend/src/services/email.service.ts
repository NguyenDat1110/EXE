import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email service ready:', success);
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'EventFlow <noreply@eventflow.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// UC-34: Gửi email phê duyệt vendor
export const sendVendorApprovalEmail = async (
  vendorEmail: string,
  companyName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">EventFlow</div>
          <h1>Hồ sơ của bạn đã được phê duyệt!</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${companyName}</strong>,</p>
          <p>Chúng tôi vui mừng thông báo rằng hồ sơ đăng ký Vendor của bạn đã được <strong>phê duyệt</strong> thành công!</p>
          <p>Bạn giờ có thể:</p>
          <ul>
            <li>Đăng nhập vào dashboard của Vendor</li>
            <li>Quản lý các gói dịch vụ</li>
            <li>Xem danh sách các booking</li>
            <li>Cập nhật thông tin công ty</li>
          </ul>
          <p>
            <a href="${process.env.FRONTEND_URL || 'https://eventflow.com'}/vendor/dashboard" class="button">
              Truy cập Dashboard
            </a>
          </p>
          <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
          <p>Cảm ơn bạn đã chọn EventFlow!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EventFlow. All rights reserved.</p>
          <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: 'Hồ sơ Vendor của bạn đã được phê duyệt - EventFlow',
    html
  });
};

// UC-34: Gửi email từ chối vendor
export const sendVendorRejectionEmail = async (
  vendorEmail: string,
  companyName: string,
  reason: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">EventFlow</div>
          <h1>Thông báo về hồ sơ Vendor</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${companyName}</strong>,</p>
          <p>Cảm ơn bạn đã nộp đơn đăng ký Vendor cho EventFlow. Sau khi xem xét kỹ lưỡng, chúng tôi xin thông báo rằng hồ sơ của bạn <strong>chưa được phê duyệt</strong> tại thời điểm này.</p>
          
          <div class="reason-box">
            <strong>Lý do từ chối:</strong><br/>
            ${reason}
          </div>
          
          <p><strong>Các bước tiếp theo:</strong></p>
          <ul>
            <li>Vui lòng xem xét lại lý do từ chối</li>
            <li>Cập nhật thông tin hồ sơ của bạn</li>
            <li>Nộp đơn xin phê duyệt lại</li>
          </ul>
          
          <p>Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi tại <strong>support@eventflow.com</strong>.</p>
          <p>Chúng tôi rất mong được hợp tác với bạn trong tương lai!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EventFlow. All rights reserved.</p>
          <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: 'Thông báo về hồ sơ Vendor - EventFlow',
    html
  });
};

// UC-34: Gửi email reset password
export const sendPasswordResetEmail = async (
  userEmail: string,
  resetToken: string,
  userName: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://eventflow.com'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 14px; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">EventFlow</div>
          <h1>Đặt lại mật khẩu</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn nút dưới đây để tạo mật khẩu mới:</p>
          <p>
            <a href="${resetUrl}" class="button">
              Đặt lại mật khẩu
            </a>
          </p>
          <p>Hoặc sao chép liên kết này vào trình duyệt của bạn:</p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Lưu ý bảo mật:</strong><br/>
            - Liên kết này sẽ hết hạn trong 1 giờ<br/>
            - Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này<br/>
            - Đừng chia sẻ liên kết này với ai khác
          </div>
          
          <p>Nếu bạn gặp sự cố, vui lòng liên hệ support@eventflow.com</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EventFlow. All rights reserved.</p>
          <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Đặt lại mật khẩu EventFlow',
    html
  });
};
