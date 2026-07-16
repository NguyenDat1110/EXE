import React, { useState } from 'react';
import { Post } from '../../services/postApi';
import { getVendorFirstBooth } from '../../services/exploreApi';
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar, MapPin, ImageIcon, Eye, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

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

interface EventFeedCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  isLiked?: boolean;
}

export default function EventFeedCard({ post, onLike, isLiked = false }: EventFeedCardProps) {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [isLoadingBooth, setIsLoadingBooth] = useState(false);

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);

  const handleGoToBooth = async (action: 'view' | 'book') => {
    try {
      setIsLoadingBooth(true);
      if (action === 'view') {
        navigate(`/vendors/${post.vendorId}`);
      } else {
        navigate(`/events/${post._id}`);
      }
    } catch (e) {
      alert("Đã xảy ra lỗi.");
    } finally {
      setIsLoadingBooth(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 mb-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => navigate(`/vendors/${post.vendorId}`)}
            className="cursor-pointer"
          >
            {post.vendorAvatar ? (
              <img
                src={post.vendorAvatar?.startsWith('http') ? post.vendorAvatar : `${BASE_URL}${post.vendorAvatar}`}
                alt={post.vendorName}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-cyan font-bold text-sm">
                {getAvatarInitial(post.vendorName)}
              </div>
            )}
          </div>
          <div>
            <h4 
              className="font-bold text-white text-sm hover:underline cursor-pointer"
              onClick={() => navigate(`/vendors/${post.vendorId}`)}
            >
              {post.vendorName}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-silver/60">
              <span>{formatDate(post.createdAt)}</span>
              {post.eventType && (
                <>
                  <span>•</span>
                  <span className="text-cyan">{post.eventType}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="text-silver/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 
          className="font-bold text-white mb-1 hover:text-cyan cursor-pointer transition-colors"
          onClick={() => navigate(`/events/${post._id}`)}
        >
          {post.title}
        </h3>
        <p className="text-sm text-silver/80 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images Grid */}
      {post.images.length > 0 && (
        <div className="mt-2">
          <div className={`grid gap-1 bg-white/5 ${
            post.images.length === 1 ? 'grid-cols-1 max-h-[500px]' :
            post.images.length === 2 ? 'grid-cols-2 h-64' :
            post.images.length === 3 ? 'grid-cols-2 h-64' :
            'grid-cols-2 h-72'
          }`}>
            {post.images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(post.images, i)}
                className={`relative cursor-zoom-in group bg-slate-custom ${
                  post.images.length === 3 && i === 0 ? 'row-span-2' : ''
                }`}
              >
                <img
                  src={img.startsWith('http') ? img : `${BASE_URL}${img}`}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none'; }}
                />
                
                {/* +N overlay */}
                {i === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <span className="font-bold text-2xl">+{post.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3 flex justify-between items-center text-xs text-silver/60">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center">
            <Heart className="w-3 h-3 text-cyan fill-cyan" />
          </div>
          <span>{post.likes + (isLiked ? 1 : 0)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-center border-t border-white/5 pt-3 gap-3">
          <button 
            onClick={() => onLike?.(post._id)}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl transition-all text-sm font-bold border ${
              isLiked ? 'bg-cyan/10 text-cyan border-cyan/20' : 'bg-white/5 text-silver/70 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Thích</span>
          </button>
          
          <button 
            onClick={() => handleGoToBooth('view')}
            disabled={isLoadingBooth}
            className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-silver/70 hover:text-white transition-all text-sm font-bold disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Xem Vendor</span>
          </button>

          <button 
            onClick={() => handleGoToBooth('book')}
            disabled={isLoadingBooth}
            className="flex-[1.2] flex justify-center items-center gap-2 py-2.5 rounded-xl bg-cyan text-navy hover:bg-cyan/90 transition-all text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,212,255,0.2)] disabled:opacity-50"
          >
            <CalendarCheck className="w-4 h-4" />
            Đặt Lịch
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <img
              src={lightbox.images[lightbox.index]?.startsWith('http') ? lightbox.images[lightbox.index] : `${BASE_URL}${lightbox.images[lightbox.index]}`}
              alt=""
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
