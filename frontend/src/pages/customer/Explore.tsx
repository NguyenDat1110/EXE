import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, CalendarDays, Rss, ArrowRight, Star, Users, MapPin, Loader2, Heart, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { ExploreCategoryItem, getExploreCategories } from '../../services/exploreApi';
import { getTimelinePosts, Post, toggleLikePost } from '../../services/postApi';
import { getMyBookings } from '../../services/bookingsApi';
import { useAuthStore } from '../../store/authStore';
import VendorStoryRail from '../../components/customer/VendorStoryRail';
import EventFeedCard from '../../components/customer/EventFeedCard';
import TrendingVendors from '../../components/customer/TrendingVendors';

const EVENT_TYPES = [
  'Tất cả',
  'Tiệc sinh nhật',
  'Tiệc công ty',
  'Hội nghị',
];

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<ExploreCategoryItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState('Tất cả');
  const [bookingStats, setBookingStats] = useState({ pending: 0, completed: 0 });

  useEffect(() => {
    if (user) {
      getMyBookings()
        .then((res) => {
          const bookingsList = res?.data?.bookings || [];
          const getStatusGroup = (status: string) => {
            if (['completed'].includes(status)) return 'completed';
            if (['confirmed', 'customer_completed', 'vendor_completed'].includes(status)) return 'confirmed';
            if (['cancelled', 'deposit_rejected'].includes(status)) return 'cancelled';
            return 'pending'; // pending, waiting_deposit
          };
          const pending = bookingsList.filter((b: any) => getStatusGroup(b.status) === 'pending').length;
          const completed = bookingsList.filter((b: any) => getStatusGroup(b.status) === 'completed').length;
          setBookingStats({ pending, completed });
        })
        .catch(() => { });
    }
  }, [user]);

  useEffect(() => {
    getExploreCategories().then(data => setCategories(data || [])).catch(() => { });
  }, []);

  const fetchPosts = useCallback(async (pageNum = 1, replace = true, type = filterType) => {
    try {
      if (replace) setLoadingPosts(true);
      else setLoadingMore(true);

      const data = await getTimelinePosts(pageNum, 10, type, '');

      setPosts((prev) => replace ? data.posts : [...prev, ...data.posts]);
      setTotalPages(data.pagination.totalPages);
      setPage(pageNum);
    } catch {
      // silent
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchPosts(1, true, filterType);
  }, [filterType]);

  const toggleLike = async (postId: string) => {
    try {
      const res = await toggleLikePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isLiked: res.isLiked, likes: res.likes } : p
        )
      );
    } catch {
      // silent
    }
  };

  const totalBoothsCount = useMemo(() => categories.reduce((acc, cat) => acc + cat.count, 0), [categories]);

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-8">

        {/* LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
          {/* User Profile Widget */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-cyan/20 to-purple-500/20" />
            <div className="relative z-10 flex flex-col items-center pt-6">
              <div className="w-20 h-20 rounded-full border-4 border-navy bg-slate-custom p-0.5 overflow-hidden mb-3">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt={user?.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="font-bold text-white text-lg">{user?.name || 'Customer'}</h3>
              <p className="text-xs text-silver/60 uppercase tracking-widest">{user?.role || 'Thành viên'}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white">{bookingStats.pending}</p>
                <p className="text-[10px] uppercase text-silver/60 tracking-wider">Đơn đang chờ</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{bookingStats.completed}</p>
                <p className="text-[10px] uppercase text-silver/60 tracking-wider">Hoàn tất</p>
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="glass-panel p-3 rounded-2xl border border-white/5 space-y-1">
            <Link to="/explore" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan/10 text-cyan font-semibold transition-colors">
              <Compass className="w-5 h-5" />
              Khám phá
            </Link>
            <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-silver/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
              <CalendarDays className="w-5 h-5" />
              Đơn đặt chỗ
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-silver/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
              <Users className="w-5 h-5" />
              Hồ sơ cá nhân
            </Link>
          </div>

          {/* Mini Categories */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Danh mục</h3>
            <div className="space-y-3">
              {categories.slice(0, 5).map(cat => (
                <Link key={cat.slug} to={`/explore/${cat.slug}`} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-silver/80 group-hover:text-cyan transition-colors text-sm font-medium capitalize">
                    <span className="w-2 h-2 rounded-full bg-cyan/50 group-hover:bg-cyan group-hover:shadow-[0_0_10px_rgba(0,212,255,0.8)] transition-all" />
                    {cat.slug}
                  </div>
                  <span className="text-xs text-silver/40 bg-white/5 px-2 py-0.5 rounded-full">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="min-w-0">
          {/* Greeting */}
          <div className="mb-6 px-2">
            <h1 className="text-2xl font-bold text-white">Xin chào, {user?.name?.split(' ')[0] || 'bạn'}! 👋</h1>
            <p className="text-silver/60 text-sm mt-1">Khám phá những ý tưởng sự kiện tuyệt vời hôm nay.</p>
          </div>

          {/* Story Row */}
          <div className="mb-6">
            <VendorStoryRail />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide sticky top-20 z-20 bg-navy/80 backdrop-blur-md pt-2 px-1">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterType === type
                  ? 'bg-cyan text-navy shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                  : 'bg-white/5 text-silver hover:bg-white/10'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Feed Posts */}
          <div className="space-y-6">
            {loadingPosts ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-cyan" />
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-panel p-10 rounded-2xl text-center">
                <Rss className="w-12 h-12 text-silver/20 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Chưa có bài viết nào</h3>
                <p className="text-sm text-silver/60">Không tìm thấy sự kiện nào trong danh mục này.</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <EventFeedCard
                    key={post._id}
                    post={post}
                    onLike={toggleLike}
                    isLiked={post.isLiked}
                  />
                ))}

                {page < totalPages && (
                  <button
                    onClick={() => fetchPosts(page + 1, false)}
                    disabled={loadingMore}
                    className="w-full py-4 glass-panel rounded-2xl text-cyan font-bold hover:bg-cyan/10 transition-colors flex items-center justify-center gap-2 border border-white/5"
                  >
                    {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</> : 'Tải thêm bài viết'}
                  </button>
                )}
              </>
            )}
          </div>
        </main>

        {/* RIGHT PANEL (Desktop) */}
        <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
          {/* Trending Vendors */}
          <TrendingVendors />

          {/* Call to Action Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-cyan/30 p-6 flex flex-col justify-end min-h-[200px] group cursor-pointer" onClick={() => navigate('/explore/business')}>
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80&auto=format&fit=crop"
              alt="Promo"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
            <div className="relative z-10">
              <span className="px-2.5 py-1 bg-cyan text-navy text-[10px] font-bold uppercase tracking-widest rounded-md mb-2 inline-block">Mới Nhất</span>
              <h3 className="font-bold text-white text-lg mb-1 leading-tight">Giải pháp sự kiện doanh nghiệp trọn gói</h3>
              <p className="text-xs text-silver/80 flex items-center gap-1 mt-2 font-semibold">Khám phá <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></p>
            </div>
          </div>

          <div className="text-xs text-silver/40 text-center px-4">
            &copy; 2026 ClickPick. Nền tảng kết nối sự kiện hàng đầu.
          </div>
        </aside>

      </div>
    </div>
  );
}
