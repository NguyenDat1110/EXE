import api from './api';

export interface Post {
  _id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  title: string;
  content: string;
  images: string[];
  eventType?: string;
  likes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Lấy tất cả bài viết (customer timeline)
export const getTimelinePosts = async (
  page = 1,
  limit = 10,
  eventType?: string,
  search?: string
): Promise<PostsResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (eventType && eventType !== 'Tất cả') params.set('eventType', eventType);
  if (search) params.set('search', search);
  const res = await api.get(`/posts?${params.toString()}`);
  return res.data;
};

// Vendor lấy bài viết của mình
export const getMyPosts = async (): Promise<{ posts: Post[] }> => {
  const res = await api.get('/posts/my');
  return res.data;
};

// Vendor tạo bài viết mới (có upload ảnh)
export const createPost = async (data: Partial<Post>): Promise<{ post: Post }> => {
  const res = await api.post('/posts', data);
  return res.data;
};

// Vendor cập nhật bài viết (có upload ảnh)
export const updatePost = async (postId: string, data: Partial<Post>): Promise<{ post: Post }> => {
  const res = await api.patch(`/posts/${postId}`, data);
  return res.data;
};

// Vendor xóa bài viết
export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(`/posts/${postId}`);
};

// Admin lấy tất cả bài viết
export const adminGetAllPosts = async (page = 1, limit = 10, search = '', eventType = ''): Promise<PostsResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (eventType && eventType !== 'Tất cả') params.append('eventType', eventType);
  const res = await api.get(`/posts/admin/all?${params}`);
  return res.data;
};

// Admin xóa bài viết
export const adminDeletePost = async (postId: string): Promise<void> => {
  await api.delete(`/posts/${postId}`);
};

// Customer xem chi tiết bài viết
export const getPostById = async (postId: string): Promise<{ post: Post, boothId: string }> => {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
};

// Customer xem hồ sơ vendor public (tất cả bài viết)
export const getVendorPosts = async (vendorId: string): Promise<{ vendor: any, posts: Post[], boothId: string }> => {
  const res = await api.get(`/posts/vendor/${vendorId}`);
  return res.data;
};