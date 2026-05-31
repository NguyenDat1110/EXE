import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Star } from 'lucide-react';
import { ExploreCategorySlug, ExploreBoothListItem, getBoothsByCategory } from '../../services/exploreApi';

const CATEGORY_META: Record<ExploreCategorySlug, { label: string; hero: string; description: string }> = {
  wedding: {
    label: 'Tiệc cưới',
    hero: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&q=80&auto=format&fit=crop',
    description: 'Không gian và concept cho ngày trọng đại, từ ấm cúng đến xa hoa.'
  },
  seminar: {
    label: 'Hội thảo',
    hero: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400&q=80&auto=format&fit=crop',
    description: 'Giải pháp setup chuyên nghiệp cho hội nghị, workshop và triển lãm.'
  },
  birthday: {
    label: 'Sinh nhật',
    hero: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1400&q=80&auto=format&fit=crop',
    description: 'Các concept sinh nhật sáng tạo, từ trẻ em đến người lớn.'
  },
  anniversary: {
    label: 'Kỷ niệm',
    hero: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1400&q=80&auto=format&fit=crop',
    description: 'Dịch vụ trang trí sự kiện kỷ niệm, lễ thành lập và dấu mốc đặc biệt.'
  }
};

const VALID_CATEGORIES = Object.keys(CATEGORY_META) as ExploreCategorySlug[];

const toCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value || 0);

const truncateText = (text: string, max = 120) => {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
};

export default function BoothList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booths, setBooths] = useState<ExploreBoothListItem[]>([]);

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

  if (!selectedCategory) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-red-200">
        Loại sự kiện không hợp lệ. Vui lòng quay lại trang Explore.
      </div>
    );
  }

  const categoryMeta = CATEGORY_META[selectedCategory];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[260px]">
        <img src={categoryMeta.hero} alt={categoryMeta.label} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/30" />
        <div className="relative p-6 md:p-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan/90 mb-3">Explore / {categoryMeta.label}</p>
          <h1 className="text-3xl md:text-4xl font-serif italic text-white mb-3">Danh sách gian hàng {categoryMeta.label}</h1>
          <p className="text-silver/80">{categoryMeta.description}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-silver/50" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả gian hàng"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-cyan/50"
          />
        </form>

        <Link
          to="/explore"
          className="inline-flex items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-3 text-sm font-semibold text-cyan hover:bg-cyan/20 transition-colors"
        >
          Đổi loại sự kiện
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-200 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-56 rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : booths.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-silver/70">
          Không tìm thấy gian hàng phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {booths.map((booth) => (
            <button
              key={booth._id}
              onClick={() => navigate(`/booths/${booth._id}`)}
              className="text-left overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan/40 hover:bg-white/[0.06] transition-colors"
            >
              <div className="h-44 w-full overflow-hidden bg-slate-custom">
                {booth.coverImage ? (
                  <img
                    src={booth.coverImage}
                    alt={booth.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-silver/50">No image</div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-manrope font-bold text-white">{booth.name}</h2>
                  <div className="inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-xs text-yellow-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {booth.averageRating > 0 ? booth.averageRating.toFixed(1) : 'N/A'}
                  </div>
                </div>

                <p className="text-sm text-silver/75">{truncateText(booth.description || '')}</p>

                <div className="flex items-center gap-2 text-sm text-silver/70">
                  <MapPin className="h-4 w-4 text-cyan" />
                  <span>{booth.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>

                <p className="text-xs text-silver/50">{booth.reviewCount > 0 ? `${booth.reviewCount} đánh giá` : 'Chưa có đánh giá'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
