import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoothsByCategory, ExploreBoothListItem } from '../../services/exploreApi';
import { Star, TrendingUp } from 'lucide-react';

export default function TrendingVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<ExploreBoothListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        // Fetch from multiple to get a pool of booths
        const [birthday, business] = await Promise.all([
          getBoothsByCategory('birthday').catch(() => ({ data: [] })),
          getBoothsByCategory('business').catch(() => ({ data: [] }))
        ]);
        
        const combined = [...(birthday.data || []), ...(business.data || [])];
        const unique = Array.from(new Map(combined.map(b => [b._id, b])).values());
        
        // Sort by rating and reviews
        const sorted = unique.sort((a, b) => {
          if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
          return b.reviewCount - a.reviewCount;
        });

        setVendors(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch trending vendors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan" /> Nổi bật
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 bg-white/5 animate-pulse rounded" />
                <div className="h-2 w-1/3 bg-white/5 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vendors.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
        <TrendingUp className="w-4 h-4 text-cyan" /> 
        Vendor Nổi Bật
      </h3>
      
      <div className="space-y-4">
        {vendors.map((vendor, idx) => (
          <div key={vendor._id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/booths/${vendor._id}`)}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={vendor.coverImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${vendor._id}`} 
                  alt={vendor.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-cyan/50 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-navy rounded-full flex items-center justify-center text-[8px] font-bold text-cyan border border-white/10">
                  {idx + 1}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate group-hover:text-cyan transition-colors">{vendor.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-silver/60">
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-medium">{vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'Mới'}</span>
                  </div>
                  <span>•</span>
                  <span>{vendor.reviewCount} đánh giá</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
