import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoothsByCategory, ExploreBoothListItem } from '../../services/exploreApi';
import { Star } from 'lucide-react';

export default function VendorStoryRail() {
  const navigate = useNavigate();
  const [booths, setBooths] = useState<ExploreBoothListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Fetch booths from both main categories
        const [birthday, business] = await Promise.all([
          getBoothsByCategory('birthday').catch(() => ({ data: [] })),
          getBoothsByCategory('business').catch(() => ({ data: [] }))
        ]);
        
        // Combine and shuffle or just combine
        const combined = [...(birthday.data || []), ...(business.data || [])];
        
        // Filter out unique booths just in case
        const uniqueBooths = Array.from(new Map(combined.map(b => [b._id, b])).values());
        
        setBooths(uniqueBooths.slice(0, 10)); // Top 10 for stories
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-20">
            <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
            <div className="w-12 h-2 bg-white/5 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (booths.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x">
      {booths.map((booth) => (
        <button
          key={booth._id}
          onClick={() => navigate(`/booths/${booth._id}`)}
          className="flex flex-col items-center gap-2 shrink-0 w-[72px] group snap-start"
        >
          <div className="relative">
            <div className="w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border-2 border-navy overflow-hidden bg-slate-custom">
                <img 
                  src={booth.coverImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${booth._id}`} 
                  alt={booth.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="text-center w-full">
            <p className="text-[10px] font-semibold text-white truncate max-w-full">
              {booth.name}
            </p>
            {booth.averageRating > 0 && (
              <div className="flex items-center justify-center gap-0.5 text-[9px] text-yellow-400 mt-0.5">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>{booth.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
