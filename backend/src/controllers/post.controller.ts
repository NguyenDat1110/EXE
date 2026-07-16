import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Post } from '../models/post.model';
import { Vendor } from '../models/vendor.model';
import { Booth } from '../models/booth.model';
import { Types } from 'mongoose';
import { User } from '../models/user.model';
import { createNotification } from './notification.controller';
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

    const { title, content, eventType, images, packageId } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Tiêu đề và nội dung không được để trống' });
      return;
    }

    const imageUrls = Array.isArray(images) ? images : [];

    const post = await Post.create({
      vendorId: vendor._id,
      vendorName: vendor.companyName || 'Vendor',
      vendorAvatar: vendor.avatar,
      title,
      content,
      eventType,
      images: imageUrls,
      packageId: packageId || undefined,
    });

    // Notify all admins about new post
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'new_vendor_post',
          'Bài viết mới từ vendor',
          `${vendor.companyName || 'Vendor'} đã đăng bài viết mới: "${title}"`
        );
      }
    } catch (_err) {
      // non-fatal
    }

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
        .limit(limit)
        .populate('packageId'),
      Post.countDocuments(filter),
    ]);

    const postsWithLikes = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: req.user ? (post.likedBy || []).some(id => String(id) === String(req.user!.id)) : false
      };
    });

    res.json({
      posts: postsWithLikes,
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

// Toggle Like Post
export const toggleLikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Không tìm thấy bài viết.' });
      return;
    }

    const userId = new Types.ObjectId(req.user.id);
    const likedBy = post.likedBy || [];
    const index = likedBy.findIndex(id => String(id) === String(userId));

    if (index > -1) {
      // Unlike
      likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
    }

    post.likedBy = likedBy;
    await post.save();

    res.json({ message: 'Thành công', likes: post.likes, isLiked: index === -1 });
  } catch (err) {
    console.error('toggleLikePost error:', err);
    res.status(500).json({ message: 'Lỗi server khi thích bài viết' });
  }
};

// Get Liked Posts for current user
export const getLikedPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yêu cầu xác thực.' });
      return;
    }
    const posts = await Post.find({
      likedBy: new Types.ObjectId(req.user.id),
      isPublished: true
    }).sort({ createdAt: -1 }).populate('packageId');

    const postsWithLikes = posts.map(post => ({
      ...post.toObject(),
      isLiked: true
    }));

    res.json({ posts: postsWithLikes });
  } catch (err) {
    console.error('getLikedPosts error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết đã thích' });
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
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('packageId'),
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

    const posts = await Post.find({ vendorId: vendor._id }).sort({ createdAt: -1 }).populate('packageId');
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

    const { title, content, eventType, images, packageId } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (eventType !== undefined) post.eventType = eventType;
    if (images !== undefined) post.images = images;
    if (packageId !== undefined) post.packageId = packageId || undefined;

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

    // Image deletion should be handled by Cloudinary via a cron job or webhook
    // We will just delete the DB record.

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

    const post = await Post.findOne({ _id: postId, isPublished: true }).populate('packageId');

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

    const posts = await Post.find({ vendorId, isPublished: true }).sort({ createdAt: -1 }).populate('packageId');
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