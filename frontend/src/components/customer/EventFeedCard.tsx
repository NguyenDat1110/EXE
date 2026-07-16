import React, { useState } from 'react';
import { Post } from '../../services/postApi';
import { getVendorFirstBooth } from '../../services/exploreApi';
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar, MapPin, ImageIcon, Eye, CalendarCheck, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStageBuilderStore } from '../../store/stageBuilderStore';
import { useNavigate } from 'react-router-dom';

const ThreeDViewer = React.lazy(() => import('../features/stage-builder/ThreeDViewer'));

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
  const [show3DModal, setShow3DModal] = useState(false);

  const handleOpen3D = (stageLayout: any[]) => {
    useStageBuilderStore.setState({ items: stageLayout });
    setShow3DModal(true);
  };

  const handleClose3D = () => {
    setShow3DModal(false);
    useStageBuilderStore.getState().clearAll();
  };

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

      {/* Package attached info card */}
      {post.packageId && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Đính kèm gói dịch vụ</p>
              <h4 className="font-bold text-white text-sm">{post.packageId.name}</h4>
              <p className="text-xs text-silver/60">Giá từ: <span className="text-cyan font-bold">{(post.packageId.price || 0).toLocaleString('vi-VN')} đ</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {post.packageId.stageLayout && post.packageId.stageLayout.length > 0 && (
              <button
                onClick={() => handleOpen3D(post.packageId.stageLayout)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan/20 to-purple-500/20 hover:from-cyan/30 hover:to-purple-500/30 text-cyan text-xs font-bold rounded-xl border border-cyan/30 hover:border-cyan/50 transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] group"
              >
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse group-hover:bg-purple-400 transition-colors" />
                Trải nghiệm 3D
              </button>
            )}
            
            <button
              onClick={() => handleGoToBooth('book')}
              className="flex-1 md:flex-none px-4 py-2 bg-cyan hover:bg-cyan/90 text-navy text-xs font-bold rounded-xl transition-all"
            >
              Đặt lịch
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3 flex justify-between items-center text-xs text-silver/60">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center">
            <Heart className="w-3 h-3 text-cyan fill-cyan" />
          </div>
          <span>{post.likes}</span>
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

      {/* 3D Preview Modal */}
      <AnimatePresence>
        {show3DModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-navy border border-white/10 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-navy/95">
                <div>
                  <span className="text-[10px] text-cyan font-bold uppercase tracking-wider">MÔ PHỎNG KHÔNG GIAN 3D 360°</span>
                  <h3 className="text-base font-bold text-white">{post.packageId?.name || 'Sân khấu mẫu'}</h3>
                </div>
                <button
                  onClick={handleClose3D}
                  className="p-2 rounded-full hover:bg-white/5 text-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3D Viewer */}
              <div className="flex-1 min-h-0 p-4 flex flex-col">
                <React.Suspense fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-cyan animate-spin" />
                    <span className="text-xs text-white/50">Đang khởi tạo không gian 3D...</span>
                  </div>
                }>
                  <ThreeDViewer />
                </React.Suspense>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/5 flex items-center justify-between bg-navy/95">
                <div className="text-xs text-silver/60">
                  Sử dụng <span className="text-white font-semibold">chuột trái</span> để xoay 360°, <span className="text-white font-semibold">cuộn chuột</span> để phóng to/thu nhỏ.
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-cyan">
                    {(post.packageId?.price || 0).toLocaleString('vi-VN')} đ
                  </span>
                  <button
                    onClick={() => {
                      handleClose3D();
                      handleGoToBooth('book');
                    }}
                    className="px-5 py-2 bg-cyan text-navy hover:bg-cyan/90 font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
                  >
                    Đặt lịch gói này
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
