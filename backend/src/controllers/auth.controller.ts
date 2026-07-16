import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Vendor } from '../models/vendor.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendPasswordResetEmail } from '../services/email.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, email và mật khẩu.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Định dạng email không hợp lệ.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' });
      return;
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400).json({ message: 'Email này đã được sử dụng.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || '',
      dateOfBirth: '',
      address: '',
      role: role || 'customer'
    });

    // NOTE: Do not auto-create a Vendor record at registration.
    // Vendor records are created when the user submits their business profile.

    res.status(201).json({
      message: role === 'vendor' ? 'Đăng ký vendor thành công! Vui lòng hoàn thành thông tin công ty để chúng tôi duyệt.' : 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email và mật khẩu.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'clickpick_super_secret_key_123456',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
      return;
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-06: Cập nhật thông tin cá nhân
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const { name, phone, avatar, dateOfBirth, address } = req.body;

    // Validate input
    if (name && typeof name !== 'string') {
      res.status(400).json({ message: 'Tên không hợp lệ.' });
      return;
    }

    if (phone && typeof phone !== 'string') {
      res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
      return;
    }

    if (avatar && typeof avatar !== 'string') {
      res.status(400).json({ message: 'Avatar URL không hợp lệ.' });
      return;
    }

    if (dateOfBirth && typeof dateOfBirth !== 'string') {
      res.status(400).json({ message: 'Ngày sinh không hợp lệ.' });
      return;
    }

    if (address && typeof address !== 'string') {
      res.status(400).json({ message: 'Địa chỉ không hợp lệ.' });
      return;
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth.trim();
    if (address !== undefined) updateData.address = address.trim();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
      return;
    }

    res.status(200).json({
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-05: Quên mật khẩu
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Vui lòng cung cấp email.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return 200 to prevent email enumeration
    if (!user) {
      res.status(200).json({ message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    (user as any).resetPasswordToken = resetTokenHash;
    (user as any).resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.status(200).json({ message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-05: Reset mật khẩu
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token và mật khẩu mới là bắt buộc.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: { $gt: new Date() }
    } as any);

    if (!user) {
      res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// UC-07: Đổi mật khẩu
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Không được phép truy cập.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ message: 'Thiếu Google Access Token.' });
      return;
    }

    // Verify token with Google Userinfo API
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!googleRes.ok) {
      res.status(400).json({ message: 'Google Access Token không hợp lệ.' });
      return;
    }

    const payload: any = await googleRes.json();
    const email = payload.email?.toLowerCase();
    const name = payload.name || 'Google User';
    const avatar = payload.picture || '';

    if (!email) {
      res.status(400).json({ message: 'Không lấy được email từ tài khoản Google.' });
      return;
    }

    // Find or create user with role customer
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name,
        email,
        passwordHash,
        phone: '',
        dateOfBirth: '',
        address: '',
        role: 'customer',
        avatar,
        isEmailVerified: true
      });
    } else {
      if (!user.isActive) {
        res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa.' });
        return;
      }
      // Update avatar if not set
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'clickpick_super_secret_key_123456',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Đăng nhập Google thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
