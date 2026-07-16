import { Types } from 'mongoose';
import { Notification } from '../models/notification.model';
import { sendEmail } from './email.service';
import { User } from '../models/user.model';

export const sendNotification = async (
  userId: string | Types.ObjectId,
  title: string,
  message: string,
  type: 'booking' | 'system' | 'review' | 'payment',
  link?: string,
  sendEmailNotification: boolean = true
): Promise<void> => {
  try {
    // 1. Create In-app Notification (UC-33)
    await Notification.create({
      userId,
      title,
      message,
      type,
      link
    });

    // 2. Send Email Notification (UC-34)
    if (sendEmailNotification) {
      const user = await User.findById(userId);
      if (user && user.email) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">${title}</h2>
            <p style="color: #666; line-height: 1.6;">Xin chào ${user.name},</p>
            <p style="color: #666; line-height: 1.6;">${message}</p>
            ${link ? `<p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${link}" style="display: inline-block; padding: 10px 20px; background-color: #06B6D4; color: white; text-decoration: none; border-radius: 5px;">Xem chi tiết</a></p>` : ''}
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">Đây là email tự động từ ClickPick. Vui lòng không trả lời.</p>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: title,
          html
        });
      }
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
