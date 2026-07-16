import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Heart, Calendar, Search, Filter, X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimelinePosts, Post, toggleLikePost, getLikedPosts } from '../../services/postApi';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const EVENT_TYPES = [
  'Tất cả',
  'Tiệc sinh nhật',
  'Tiệc công ty',
  'Hội nghị',
  'Sự kiện khác',
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffHrs < 1) return 'Vừa xong';
  if (diffHrs < 24) return `${diffHrs} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getAvatarInitial = (name: string) => name?.[0]?.toUpperCase() || 'V';

export default function Timeline() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);
  const showPrevImage = () =>
    setLightbox((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev));
  const showNextImage = () =>
    setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev));

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox]);

  const fetchPosts = useCallback(async (pageNum = 1, replace = true, type = filterType, keyword = search, tab = activeTab) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      if (tab === 'liked') {
        const data = await getLikedPosts();
        setPosts(data.posts);
        setTotalPages(1);
        setPage(1);
      } else {
        const data = await getTimelinePosts(pageNum, 10, type, keyword);
        setPosts((prev) => replace ? data.posts : [...prev, ...data.posts]);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, search]);

  // Initial load & Tab switch
  useEffect(() => {
    fetchPosts(1, true, filterType, search, activeTab);
  }, [activeTab]);

  const isFirstFilterRender = React.useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    if (activeTab === 'all') {
      fetchPosts(1, true, filterType, search, activeTab);
    }
  }, [filterType]);

  const isFirstSearchRender = React.useRef(true);
  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }
    if (activeTab === 'all') {
      const timer = setTimeout(() => {
        fetchPosts(1, true, filterType, search, activeTab);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const handleLikeToggle = async (postId: string) => {
    try {
      const res = await toggleLikePost(postId);
      setPosts((prev) => {
        if (activeTab === 'liked') {
          return prev.filter((p) => p._id !== postId);
        }
        return prev.map((p) =>
          p._id === postId ? { ...p, isLiked: res.isLiked, likes: res.likes } : p
        );
      });
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4">Dòng Sự Kiện</h1>
        <p className="text-silver/70 text-lg">Cập nhật những hình ảnh và khoảnh khắc đẹp nhất từ các sự kiện nổi bật của đối tác ClickPick.</p>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'all'
              ? 'bg-cyan text-navy shadow-[0_0_15px_rgba(0,212,255,0.3)]'
              : 'bg-white/5 border border-white/10 text-silver hover:bg-white/10'
            }`}
        >
          Khám phá sự kiện
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'liked'
              ? 'bg-cyan text-navy shadow-[0_0_15px_rgba(0,212,255,0.3)]'
              : 'bg-white/5 border border-white/10 text-silver hover:bg-white/10'
            }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          Yêu thích của tôi
        </button>
      </div>

      {/* Search & Filter - show only on 'all' tab */}
      {activeTab === 'all' && (
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between sticky top-24 z-30 glass-panel p-4 rounded-2xl">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver/50" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm placeholder:text-silver/50 focus:outline-none focus:border-cyan/50 focus:bg-white/10 transition-all shadow-inner"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterType === type
                ? 'bg-cyan text-navy shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                : 'bg-white/5 border border-white/10 text-silver hover:bg-white/10 hover:text-white'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-cyan" />
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-24 glass-panel rounded-3xl max-w-2xl mx-auto"
        >
          <Filter className="w-16 h-16 text-silver/20 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy bài viết</h3>
          <p className="text-silver/60">Hãy thử thay đổi từ khóa hoặc bộ lọc để xem các sự kiện khác.</p>
        </motion.div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts.map((post, idx) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 10) * 0.05 }}
              key={post._id}
              className="break-inside-avoid bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-cyan/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] group"
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 p-5">
                {post.vendorAvatar ? (
                  <img
                    src={post.vendorAvatar?.startsWith('http') ? post.vendorAvatar : `${BASE_URL}${post.vendorAvatar}`}
                    alt={post.vendorName}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-cyan font-bold text-lg shadow-lg">
                    {getAvatarInitial(post.vendorName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base truncate group-hover:text-cyan transition-colors">{post.vendorName}</p>
                  <div className="flex items-center gap-2 text-xs text-silver/60 mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.createdAt)}</span>
                    {post.eventType && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-cyan font-semibold uppercase tracking-wider text-[10px] bg-cyan/10 px-2 py-0.5 rounded">{post.eventType}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-5 pb-4">
                <h3 className="font-bold text-white text-lg mb-2">{post.title}</h3>
                <p className="text-silver/80 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Post Images (Masonry styled inside card) */}
              {post.images.length > 0 && (
                <div className="px-5 pb-5">
                  <div className={`grid gap-2 rounded-2xl overflow-hidden ${post.images.length === 1 ? 'grid-cols-1' :
                    post.images.length === 2 ? 'grid-cols-2 h-48' :
                      post.images.length >= 3 ? 'grid-cols-2 h-64' : ''
                    }`}>
                    {post.images.slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => openLightbox(post.images, i)}
                        className={`relative cursor-zoom-in group/img bg-slate-custom ${post.images.length >= 3 && i === 0 ? 'row-span-2' : ''
                          }`}
                      >
                        <img
                          src={img.startsWith('http') ? img : `${BASE_URL}${img}`}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors" />

                        {i === 2 && post.images.length > 3 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <ImageIcon className="w-6 h-6 mb-1 opacity-70" />
                            <span className="font-bold text-lg">+{post.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-4 px-5 py-4 border-t border-white/5 bg-white/[0.01]">
                <button
                  onClick={() => handleLikeToggle(post._id)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${post.isLiked ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-silver/60 hover:text-red-400 hover:bg-red-400/10 px-3 py-1.5 -ml-3 rounded-full'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current scale-110' : 'scale-100'}`} />
                  <span>{post.likes}</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && page < totalPages && (
        <div className="text-center pt-12">
          <button
            onClick={() => fetchPosts(page + 1, false)}
            disabled={loadingMore}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-bold hover:bg-white/10 hover:border-cyan/50 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto shadow-lg"
          >
            {loadingMore ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang tải thêm...</>
            ) : 'Xem thêm bài viết'}
          </button>
        </div>
      )}

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); showPrevImage(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 backdrop-blur-md"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); showNextImage(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 backdrop-blur-md"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <motion.img
              key={lightbox.index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={lightbox.images[lightbox.index]?.startsWith('http') ? lightbox.images[lightbox.index] : `${BASE_URL}${lightbox.images[lightbox.index]}`}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            />

            {lightbox.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold tracking-widest border border-white/10">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}