import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Calendar, Search, FileText, AlertCircle } from 'lucide-react';
import { adminGetAllPosts, adminDeletePost, Post } from '../../services/postApi';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getAvatarInitial = (name: string) => name?.[0]?.toUpperCase() || 'V';

export default function AdminArticles() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('Tất cả');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const openLightbox = (images: string[], index: number) => setLightbox({ images: images.map((img) => `${BASE_URL}${img}`), index });
  const closeLightbox = () => setLightbox(null);
  const showPrev = () => setLightbox((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev));
  const showNext = () => setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev));

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await adminGetAllPosts(pageNum, 20);
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setPage(pageNum);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Xóa bài viết này?')) return;
    setDeletingId(postId);
    try {
      await adminDeletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setTotal((t) => t - 1);
      setSuccess('Đã xóa bài viết');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Không thể xóa bài viết');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      (eventFilter === 'Tất cả' || p.eventType === eventFilter) &&
      (!search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Quản Lý Bài Viết</h1>
        <p className="text-silver text-sm">
          Tổng cộng <span className="text-cyan font-semibold">{total}</span> bài viết từ tất cả vendor
        </p>
      </div>

      {/* Toast */}
      {success && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-cyan/10 border border-cyan/30 rounded-xl text-cyan text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết hoặc tên vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan/40"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['Tất cả', 'Tiệc sinh nhật', 'Tiệc công ty', 'Sự kiện khác'].map((type) => (
          <button
            key={type}
            onClick={() => setEventFilter(type)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              eventFilter === type
                ? 'bg-cyan text-navy'
                : 'bg-white/5 text-silver hover:bg-white/10 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Không có bài viết nào</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Vendor Avatar */}
                  <div className="shrink-0">
                    {post.vendorAvatar ? (
                      <img
                        src={`${BASE_URL}${post.vendorAvatar}`}
                        alt={post.vendorName}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan/20 border border-cyan/30 flex items-center justify-center text-cyan font-bold text-sm">
                        {getAvatarInitial(post.vendorName)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <p className="text-cyan text-sm font-semibold">{post.vendorName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                          {post.eventType && (
                            <>
                              <span>·</span>
                              <span className="text-cyan/60">{post.eventType}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingId === post._id}
                        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                        title="Xóa bài viết"
                      >
                        {deletingId === post._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-semibold text-white mb-1">{post.title}</h3>
                    <p className="text-silver text-sm leading-relaxed line-clamp-3">{post.content}</p>

                    {/* Image thumbnails */}
                    {post.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {post.images.slice(0, 4).map((img, i) => (
                          <button
                            key={i}
                            onClick={() => openLightbox(post.images, i)}
                            className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0 border border-white/10 hover:border-cyan/40 transition-colors"
                          >
                            <img
                              src={`${BASE_URL}${img}`}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).closest('button')!.style.display = 'none'; }}
                            />
                            {i === 3 && post.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">+{post.images.length - 4}</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchPosts(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm text-silver hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="text-silver text-sm px-3">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => fetchPosts(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm text-silver hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp
              </button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </div>
  );
}