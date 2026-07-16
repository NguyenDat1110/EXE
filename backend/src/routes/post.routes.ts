import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  adminGetAllPosts,
  getMyPosts,
  updatePost,
  deletePost,
  uploadPostImages,
  getPostById,
  getVendorPosts,
  toggleLikePost,
  getLikedPosts
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Specific routes FIRST (before wildcards)
router.get('/admin/all', authenticate as any, adminGetAllPosts as any);
router.get('/my', authenticate as any, getMyPosts as any);
router.get('/liked', authenticate as any, getLikedPosts as any);
router.get('/vendor/:vendorId', getVendorPosts as any);

// Public feed
router.get('/', authenticate as any, getAllPosts as any);

// Wildcard LAST
router.get('/:postId', getPostById as any);
router.post('/:postId/like', authenticate as any, toggleLikePost as any);
router.post('/', authenticate as any, createPost as any);
router.patch('/:postId', authenticate as any, updatePost as any);
router.delete('/:postId', authenticate as any, deletePost as any);

export default router;