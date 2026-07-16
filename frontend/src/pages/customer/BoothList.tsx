import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Star, ArrowLeft, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExploreCategorySlug, ExploreBoothListItem, getBoothsByCategory } from '../../services/exploreApi';

const CATEGORY_META: Record<ExploreCategorySlug, { label: string; hero: string; description: string }> = {
  birthday: {
    label: 'Tiệc sinh nhật',
    hero: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1400&q=80&auto=format&fit=crop',
    description: 'Các concept sinh nhật sáng tạo, từ trẻ em đến người lớn.'
  },
  business: {
    label: 'Tiệc doanh nghiệp',
    hero: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400&q=80&auto=format&fit=crop',
    description: 'Giải pháp setup chuyên nghiệp cho hội nghị, workshop, lễ ra mắt và sự kiện công ty.'
  }
};

const VALID_CATEGORIES = Object.keys(CATEGORY_META) as ExploreCategorySlug[];

const truncateText = (text: string, max = 120) => {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            rating >= star
              ? 'fill-yellow-400 text-yellow-400'
              : rating >= star - 0.5
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-transparent text-silver/30'
          }`}
        />
      ))}
    </div>
  );
}

export default function BoothList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'reviews'>('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booths, setBooths] = useState<ExploreBoothListItem[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const selectedCategory = useMemo(() => {
    if (!category) return null;
    return VALID_CATEGORIES.includes(category as ExploreCategorySlug)
      ? (category as ExploreCategorySlug)
      : null;
  }, [category]);

  const activeSearch = searchParams.get('search') || '';

  useEffect(() => {
    if (!selectedCategory) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await getBoothsByCategory(selectedCategory, activeSearch);
        setBooths(result.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải danh sách gian hàng.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedCategory, activeSearch]);

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const keyword = searchInput.trim();
    if (keyword) {
      next.set('search', keyword);
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const sortedBooths = useMemo(() => {
    let sorted = [...booths];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'reviews') {
      sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return sorted;
  }, [booths, sortBy]);

  if (!selectedCategory) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-red-200">
        Loại sự kiện không hợp lệ. Vui lòng quay lại trang Explore.
      </div>
    );
  }

  const categoryMeta = CATEGORY_META[selectedCategory];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Nav */}
      <Link to="/explore" className="inline-flex items-center gap-2 text-cyan text-sm hover:underline font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Quay lại Explore
      </Link>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[300px] flex flex-col justify-end"
      >
        <img src={categoryMeta.hero} alt={categoryMeta.label} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/50 to-transparent" />
        
        <div className="relative p-8 md:p-12 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="inline-flex items-center rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase text-cyan backdrop-blur-md shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              Danh mục
            </span>
            <span className="text-sm font-semibold text-silver/80">Explore / {categoryMeta.label}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-serif italic text-white mb-4 drop-shadow-lg"
          >
            {categoryMeta.label}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-silver/90 text-lg md:text-xl leading-relaxed max-w-2xl"
          >
            {categoryMeta.description}
          </motion.p>
        </div>
      </motion.section>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-30">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver/50" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả gian hàng..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:bg-white/10 transition-all shadow-inner"
          />
        </form>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="text-sm text-silver/70 font-medium">
            <span className="text-white font-bold">{loading ? '...' : booths.length}</span> gian hàng
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-silver hover:text-white hover:bg-white/10 transition-all focus:outline-none"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Sắp xếp
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-xl border border-white/10 p-2 z-50 bg-navy/95 shadow-2xl"
                  >
                    {[
                      { value: 'default', label: 'Mặc định' },
                      { value: 'rating', label: 'Đánh giá cao nhất' },
                      { value: 'reviews', label: 'Nhiều đánh giá nhất' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value as any);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          sortBy === opt.value ? 'bg-cyan/15 text-cyan' : 'text-silver hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-200 text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-[400px] rounded-3xl border border-white/5 bg-white/[0.02] animate-pulse flex flex-col overflow-hidden">
              <div className="h-[220px] bg-white/[0.05]" />
              <div className="p-5 space-y-4">
                <div className="h-6 bg-white/[0.05] rounded-md w-3/4" />
                <div className="h-4 bg-white/[0.05] rounded-md w-full" />
                <div className="h-4 bg-white/[0.05] rounded-md w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedBooths.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-silver/30" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy gian hàng</h3>
          <p className="text-silver/60">Không có gian hàng nào phù hợp với tìm kiếm của bạn. Vui lòng thử từ khóa khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBooths.map((booth, index) => (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={booth._id}
              onClick={() => navigate(`/booths/${booth._id}`)}
              className="group text-left overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] hover:border-cyan/40 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-custom shrink-0">
                {booth.coverImage ? (
                  <img
                    src={booth.coverImage}
                    alt={booth.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-silver/30 font-medium">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-80" />
                
                {/* Float Rating Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md px-2.5 py-1 text-xs font-bold shadow-lg">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white">{booth.averageRating > 0 ? booth.averageRating.toFixed(1) : 'Mới'}</span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-grow flex flex-col">
                <div className="space-y-1 flex-grow">
                  <h2 className="text-xl font-manrope font-bold text-white group-hover:text-cyan transition-colors line-clamp-1">{booth.name}</h2>
                  <p className="text-sm text-silver/70 line-clamp-2 leading-relaxed h-10">{truncateText(booth.description || '')}</p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3 shrink-0">
                  <div className="flex items-center gap-2 text-sm text-silver/80">
                    <MapPin className="h-4 w-4 text-cyan shrink-0" />
                    <span className="truncate">{booth.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StarRating rating={booth.averageRating} />
                      <span className="text-xs text-silver/50 font-medium">
                        ({booth.reviewCount > 0 ? `${booth.reviewCount}` : '0'})
                      </span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      Xem chi tiết →
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
