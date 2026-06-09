import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  adminGetAllPosts,
  getMyPosts,
  updatePost,
  deletePost,
  uploadPostImages,
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public: Customer & Admin xem timeline
router.get('/', authenticate as any, getAllPosts as any);

// Admin: Xem tất cả bài viết (kể cả unpublished)
router.get('/admin/all', authenticate as any, adminGetAllPosts as any);

// Vendor: CRUD bài viết của mình
router.get('/my', authenticate as any, getMyPosts as any);
router.post('/', authenticate as any, (req, res, next) => {
  uploadPostImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createPost as any);
router.patch('/:postId', authenticate as any, updatePost as any);
router.delete('/:postId', authenticate as any, deletePost as any);

export default router;