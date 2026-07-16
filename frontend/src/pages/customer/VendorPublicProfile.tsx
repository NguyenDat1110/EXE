import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVendorPosts, Post } from '../../services/postApi';
import { Star, MapPin, CalendarCheck, Shield, ChevronLeft, CalendarDays, Rss } from 'lucide-react';
import EventFeedCard from '../../components/customer/EventFeedCard';

const BASE_URL = 'http://localhost:5000';
const getAvatarInitial = (name: string) => name?.[0]?.toUpperCase() || 'V';

export default function VendorPublicProfile() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [boothId, setBoothId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorId) {
      getVendorPosts(vendorId)
        .then(data => {
          setVendor(data.vendor);
          setPosts(data.posts);
          setBoothId(data.boothId);
        })
        .catch(() => alert('Không tìm thấy thông tin vendor'))
        .finally(() => setLoading(false));
    }
  }, [vendorId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-silver/60">
        Hồ sơ không tồn tại hoặc đã bị ẩn.
        <br />
        <button onClick={() => navigate('/explore')} className="mt-4 text-cyan hover:underline">Quay lại Khám phá</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-silver/60 hover:text-white transition-colors mb-6 font-semibold"
      >
        <ChevronLeft className="w-5 h-5" /> Quay lại
      </button>

      {/* Header / Cover */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/10 bg-slate-custom">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan/20 to-purple-500/20 opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
        
        <div className="relative z-10 px-6 sm:px-12 pt-24 pb-8 flex flex-col sm:flex-row items-end gap-6 sm:gap-10">
          <div className="w-32 h-32 rounded-full border-4 border-navy bg-slate-custom shrink-0 overflow-hidden shadow-2xl">
            {vendor.avatar ? (
              <img 
                src={`${BASE_URL}${vendor.avatar}`} 
                alt={vendor.companyName} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan/20 to-blue-500/20 flex items-center justify-center text-cyan font-bold text-4xl">
                {getAvatarInitial(vendor.companyName)}
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{vendor.companyName}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-silver/80">
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-white">{vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'Mới'}</span>
                    <span>({vendor.reviewCount} đánh giá)</span>
                  </div>
                  {vendor.companyAddress && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan" />
                      <span>{vendor.companyAddress}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="shrink-0">
                <button 
                  onClick={() => boothId ? navigate(`/booths/${boothId}`) : alert("Vendor này chưa có gian hàng để đặt lịch")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-cyan text-navy font-black uppercase tracking-wider hover:bg-cyan/90 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Đặt Lịch Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content: Posts */}
        <div>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <Rss className="w-6 h-6 text-cyan" />
            <h2 className="text-2xl font-bold text-white">Hoạt động ({posts.length})</h2>
          </div>

          {posts.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center">
              <CalendarDays className="w-12 h-12 text-silver/20 mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">Chưa có hoạt động</h3>
              <p className="text-sm text-silver/60">Vendor này chưa đăng bài viết sự kiện nào.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <EventFeedCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: About */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan" /> Giới thiệu
            </h3>
            <p className="text-silver/80 text-sm leading-relaxed whitespace-pre-wrap">
              {vendor.bio || 'Chưa có thông tin giới thiệu về vendor này.'}
            </p>
            
            <div className="mt-6 pt-4 border-t border-white/5 space-y-3 text-sm text-silver/70">
              {vendor.email && (
                <div className="flex items-center gap-3">
                  <span className="w-6 font-medium">✉️</span>
                  <span>{vendor.email}</span>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-3">
                  <span className="w-6 font-medium">📞</span>
                  <span>{vendor.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-cyan/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Đối tác xác thực</h4>
                <p className="text-xs text-silver/70 leading-relaxed">Vendor đã được xác thực danh tính và thông tin liên hệ bởi ClickPick.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
