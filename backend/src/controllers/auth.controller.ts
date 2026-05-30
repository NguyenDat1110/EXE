import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Vendor } from '../models/vendor.model';
import { AuthRequest } from '../middleware/auth.middleware';

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

    // If vendor role, create vendor record
    if (role === 'vendor') {
      await Vendor.create({
        userId: newUser._id,
        companyName: '',
        taxId: undefined,
        companyAddress: '',
        businessLicense: '',
        phone: phone || '',
        email: email.toLowerCase(),
        verificationStatus: 'pending',
        isVerified: false,
        packages: []
      });
    }

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
