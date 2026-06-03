import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { ExploreCategoryItem, ExploreCategorySlug, getExploreCategories } from '../../services/exploreApi';

const CATEGORY_CARDS: Record<ExploreCategorySlug, { title: string; image: string; accent: string }> = {
  birthday: {
    title: 'Sinh nhật',
    image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80&auto=format&fit=crop',
    accent: 'from-amber-500/70'
  },
  business: {
    title: 'Doanh nghiệp',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80&auto=format&fit=crop',
    accent: 'from-cyan-500/70'
  }
};

const FALLBACK_ORDER: ExploreCategorySlug[] = ['birthday', 'business'];

export default function Explore() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ExploreCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getExploreCategories();
        setItems(data || []);
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categories = useMemo(() => {
    if (items.length > 0) {
      return items
        .filter((item) => Boolean(CATEGORY_CARDS[item.slug]))
        .map((item) => ({
          slug: item.slug,
          title: CATEGORY_CARDS[item.slug].title,
          image: CATEGORY_CARDS[item.slug].image,
          accent: CATEGORY_CARDS[item.slug].accent,
          count: item.count
        }));
    }

    return FALLBACK_ORDER.map((slug) => ({
      slug,
      title: CATEGORY_CARDS[slug].title,
      image: CATEGORY_CARDS[slug].image,
      accent: CATEGORY_CARDS[slug].accent,
      count: 0
    }));
  }, [items]);

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-serif italic text-white flex items-center gap-3">
          <Compass className="w-8 h-8 text-cyan" />
          Explore
        </h1>
        <p className="text-silver/70 mt-3 text-lg leading-relaxed">
          Chọn loại sự kiện để xem danh sách gian hàng phù hợp và đi đến trang chi tiết dịch vụ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => navigate(`/explore/${cat.slug}`)}
            className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-cyan/50 transition-all duration-300 text-left"
          >
            <img
              src={cat.image}
              alt={cat.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} via-navy/50 to-navy/20`} />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 right-5">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs tracking-[0.14em] uppercase text-cyan/90">
                {loading ? 'Đang tải...' : `${cat.count} gian hàng`}
              </span>
              <h3 className="text-2xl font-bold font-manrope text-white mt-3">{cat.title}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
