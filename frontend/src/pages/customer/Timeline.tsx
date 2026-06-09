import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Heart, Calendar, Search, Filter } from 'lucide-react';
import { getTimelinePosts, Post } from '../../services/postApi';

const BASE_URL = 'http://localhost:5000';

const EVENT_TYPES = [
  'Tất cả',
  'Tiệc sinh nhật',
  'Tiệc cưới',
  'Hội nghị',
  'Workshop',
  'Lễ tốt nghiệp',
  'Tiệc công ty',
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
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const data = await getTimelinePosts(pageNum, 10);

      setPosts((prev) => replace ? data.posts : [...prev, ...data.posts]);
      setTotalPages(data.pagination.totalPages);
      setPage(pageNum);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'Tất cả' || p.eventType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Khám Phá Sự Kiện</h1>
        <p className="text-silver text-sm">Xem các sự kiện mới nhất từ các vendor uy tín</p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan/40"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === type
                  ? 'bg-cyan text-navy'
                  : 'bg-white/5 border border-white/10 text-silver hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <Filter className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Không tìm thấy bài viết nào</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <article key={post._id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
              {/* Post Header */}
              <div className="flex items-center gap-3 p-4 pb-3">
                {post.vendorAvatar ? (
                  <img
                    src={`${BASE_URL}${post.vendorAvatar}`}
                    alt={post.vendorName}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cyan/20 border border-cyan/30 flex items-center justify-center text-cyan font-bold text-sm">
                    {getAvatarInitial(post.vendorName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{post.vendorName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.createdAt)}
                    {post.eventType && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-cyan/70">{post.eventType}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <h3 className="font-semibold text-white mb-1.5">{post.title}</h3>
                <p className="text-silver text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{post.content}</p>
              </div>

              {/* Post Images */}
              {post.images.length > 0 && (
                <div className={`grid gap-0.5 ${
                  post.images.length === 1 ? 'grid-cols-1' :
                  post.images.length === 2 ? 'grid-cols-2' :
                  post.images.length >= 3 ? 'grid-cols-3' : ''
                }`}>
                  {post.images.slice(0, 6).map((img, i) => (
                    <div key={i} className={`relative ${post.images.length === 1 ? 'aspect-video' : 'aspect-square'} ${i === 5 && post.images.length > 6 ? 'relative' : ''}`}>
                      <img
                        src={`${BASE_URL}${img}`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none'; }}
                      />
                      {i === 5 && post.images.length > 6 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">+{post.images.length - 6}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
                <button
                  onClick={() => toggleLike(post._id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    likedPosts.has(post._id) ? 'text-red-400' : 'text-white/40 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedPosts.has(post._id) ? 'fill-current' : ''}`} />
                  <span>{post.likes + (likedPosts.has(post._id) ? 1 : 0)}</span>
                </button>
              </div>
            </article>
          ))}

          {/* Load More */}
          {page < totalPages && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchPosts(page + 1, false)}
                disabled={loadingMore}
                className="px-6 py-2.5 border border-white/10 rounded-xl text-silver hover:text-white hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</>
                ) : 'Xem thêm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}