import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Post } from '../models/post.model';
import { Vendor } from '../models/vendor.model';
import { Booth } from '../models/booth.model';
import { Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Multer setup for post images ───────────────────────────────────────────

const uploadDir = path.resolve(process.cwd(), 'uploads/posts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

export const uploadPostImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  },
}).array('images', 10);

// ─── UC: Vendor tạo bài viết ─────────────────────────────────────────────────

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể đăng bài' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy thông tin vendor' });
      return;
    }

    const { title, content, eventType } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const imageUrls = files
      ? files.map((f) => `/uploads/posts/${f.filename}`)
      : [];

    const post = await Post.create({
      vendorId: vendor._id,
      vendorName: vendor.companyName || 'Vendor',
      vendorAvatar: vendor.avatar,
      title,
      content,
      eventType,
      images: imageUrls,
    });

    res.status(201).json({ message: 'Đăng bài thành công', post });
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
  }
};

// ─── UC: Lấy tất cả bài viết (public - dành cho customer & admin) ─────────────

export const getAllPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isPublished: true };

    const eventType = req.query.eventType as string | undefined;
    if (eventType && eventType !== 'Tất cả') {
      filter.eventType = eventType;
    }

    const search = (req.query.search as string | undefined)?.trim();
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: regex }, { content: regex }, { vendorName: regex }];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getAllPosts error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết' });
  }
};

// ─── UC: Admin lấy tất cả bài viết (kể cả unpublished) ──────────────────────

export const adminGetAllPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('adminGetAllPosts error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết' });
  }
};

// ─── UC: Vendor lấy bài viết của mình ───────────────────────────────────────

export const getMyPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể truy cập' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy thông tin vendor' });
      return;
    }

    const posts = await Post.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    console.error('getMyPosts error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết' });
  }
};

// ─── UC: Vendor cập nhật bài viết ───────────────────────────────────────────

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (req.user?.role !== 'vendor') {
      res.status(403).json({ message: 'Chỉ vendor mới có thể cập nhật bài viết' });
      return;
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy thông tin vendor' });
      return;
    }

    const post = await Post.findOne({ _id: postId, vendorId: vendor._id });
    if (!post) {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
      return;
    }

    const { title, content, eventType } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (eventType !== undefined) post.eventType = eventType;

    await post.save();
    res.json({ message: 'Cập nhật bài viết thành công', post });
  } catch (err) {
    console.error('updatePost error:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết' });
  }
};

// ─── UC: Vendor / Admin xóa bài viết ────────────────────────────────────────

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Chưa xác thực' });
      return;
    }

    let post;
    if (req.user.role === 'admin') {
      post = await Post.findById(postId);
    } else if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (!vendor) {
        res.status(404).json({ message: 'Không tìm thấy thông tin vendor' });
        return;
      }
      post = await Post.findOne({ _id: postId, vendorId: vendor._id });
    } else {
      res.status(403).json({ message: 'Không có quyền xóa bài viết' });
      return;
    }

    if (!post) {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
      return;
    }

    // Xóa ảnh khỏi disk
    for (const imgPath of post.images) {
      const fullPath = path.resolve(process.cwd(), imgPath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Xóa bài viết thành công' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa bài viết' });
  }
};

// ─── UC: Lấy chi tiết 1 bài viết ───────────────────────────────────────────

export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    if (!Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: 'Mã bài viết không hợp lệ.' });
      return;
    }

    const post = await Post.findOne({ _id: postId, isPublished: true });
    
    if (!post) {
      res.status(404).json({ message: 'Không tìm thấy bài viết.' });
      return;
    }

    const booth = await Booth.findOne({ vendorId: post.vendorId, isActive: true });
    
    res.json({ post, boothId: booth?._id });
  } catch (err) {
    console.error('getPostById error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết bài viết' });
  }
};

// ─── UC: Lấy tất cả bài viết của 1 vendor ────────────────────────────────────

export const getVendorPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;

    if (!Types.ObjectId.isValid(vendorId)) {
      res.status(400).json({ message: 'Mã vendor không hợp lệ.' });
      return;
    }

    const vendor = await Vendor.findById(vendorId).select('companyName email phone avatar bio companyAddress averageRating reviewCount');
    
    if (!vendor) {
      res.status(404).json({ message: 'Không tìm thấy thông tin vendor.' });
      return;
    }

    const posts = await Post.find({ vendorId, isPublished: true }).sort({ createdAt: -1 });
    const booth = await Booth.findOne({ vendorId, isActive: true });

    res.json({
      vendor,
      posts,
      boothId: booth?._id
    });
  } catch (err) {
    console.error('getVendorPosts error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết của vendor' });
  }
};