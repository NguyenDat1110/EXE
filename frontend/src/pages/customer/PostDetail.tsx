import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, Post } from '../../services/postApi';
import { Heart, MessageCircle, Share2, ArrowLeft, CalendarCheck, MapPin, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getAvatarInitial = (name: string) => name?.[0]?.toUpperCase() || 'V';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [boothId, setBoothId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (postId) {
      getPostById(postId)
        .then(data => {
          setPost(data.post);
          setBoothId(data.boothId);
        })
        .catch(() => alert('Không tìm thấy bài viết'))
        .finally(() => setLoading(false));
    }
  }, [postId]);

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-silver/60">
        Bài viết không tồn tại hoặc đã bị xóa.
        <br />
        <button onClick={() => navigate('/explore')} className="mt-4 text-cyan hover:underline">Quay lại Khám phá</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-silver/60 hover:text-white transition-colors mb-6 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" /> Quay lại
      </button>

      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        {/* Header (Vendor Info) */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/vendors/${post.vendorId}`)}>
            {post.vendorAvatar ? (
              <img
                src={`${BASE_URL}${post.vendorAvatar}`}
                alt={post.vendorName}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-cyan/50 transition-colors"
                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan/20 to-blue-500/20 border-2 border-white/10 flex items-center justify-center text-cyan font-bold text-xl group-hover:border-cyan/50 transition-colors">
                {getAvatarInitial(post.vendorName)}
              </div>
            )}
            <div>
              <h2 className="font-bold text-white text-lg group-hover:text-cyan transition-colors">{post.vendorName}</h2>
              <p className="text-sm text-silver/60 mt-0.5">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/vendors/${post.vendorId}`)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors text-sm border border-white/10"
          >
            <Eye className="w-4 h-4" /> Xem Hồ Sơ
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {post.eventType && (
            <span className="inline-block px-3 py-1 rounded-full bg-cyan/10 text-cyan text-xs font-bold uppercase tracking-widest mb-4">
              {post.eventType}
            </span>
          )}
          <h1 className="text-2xl font-bold text-white mb-4 leading-snug">{post.title}</h1>
          <p className="text-silver/90 whitespace-pre-wrap leading-relaxed text-[15px]">
            {post.content}
          </p>
        </div>

        {/* Images Grid */}
        {post.images.length > 0 && (
          <div className={`grid gap-1 bg-white/5 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            post.images.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {post.images.map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(post.images, i)}
                className={`relative cursor-zoom-in group bg-slate-custom h-[300px] sm:h-[400px] ${
                  post.images.length === 3 && i === 0 ? 'row-span-2 h-[604px] sm:h-[804px]' : ''
                }`}
              >
                <img
                  src={`${BASE_URL}${img}`}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="px-6 py-4 flex items-center justify-between text-sm text-silver/60 border-t border-white/5 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-cyan fill-cyan" />
            </div>
            <span>{post.likes + (isLiked ? 1 : 0)} lượt thích</span>
          </div>
          <span>0 bình luận</span>
        </div>

        {/* Actions */}
        <div className="p-4 bg-navy/50 flex gap-3 flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl transition-all text-sm font-bold border ${
              isLiked ? 'bg-cyan/10 text-cyan border-cyan/20' : 'bg-white/5 text-silver/70 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            Yêu thích
          </button>
          
          <button className="flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-silver/70 hover:text-white transition-all text-sm font-bold">
            <MessageCircle className="w-5 h-5" />
            Bình luận
          </button>

          <button 
            onClick={() => boothId ? navigate(`/booths/${boothId}`) : alert("Vendor này chưa có gian hàng để đặt lịch")}
            className="w-full sm:w-auto flex-[1.5] flex justify-center items-center gap-2 py-3.5 rounded-xl bg-cyan text-navy hover:bg-cyan/90 transition-all text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,212,255,0.2)]"
          >
            <CalendarCheck className="w-5 h-5" />
            Xem & Đặt Lịch
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10"
            onClick={closeLightbox}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2" onClick={closeLightbox}>Đóng</button>
            <img
              src={`${BASE_URL}${lightbox.images[lightbox.index]}`}
              alt=""
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
