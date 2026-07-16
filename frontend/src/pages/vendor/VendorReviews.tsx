import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Reply } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getVendorReviews, replyToReview, ReviewItem } from '../../services/reviewApi';

export default function VendorReviews({ showToast }: { showToast: (msg: string, type?: any) => void }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (user && user.id) {
        setVendorId(user.id);
        const reviewsRes = await getVendorReviews(user.id);
        setReviews(reviewsRes);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      showToast('Lỗi khi tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text || text.trim() === '') {
      showToast('Vui lòng nhập nội dung phản hồi', 'error');
      return;
    }

    try {
      const res = await replyToReview(reviewId, text);
      showToast('Phản hồi thành công!', 'success');
      
      // Update local state
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, vendorReply: res.review.vendorReply, repliedAt: res.review.repliedAt } : r));
      setReplyText({ ...replyText, [reviewId]: '' });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi khi gửi phản hồi', 'error');
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
    ));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-manrope">Quản Lý Đánh Giá</h1>
        <p className="text-silver/60 mt-1">Xem và phản hồi đánh giá từ khách hàng.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <MessageSquare className="w-16 h-16 text-cyan/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Chưa có đánh giá nào</h2>
          <p className="text-silver">Bạn sẽ thấy đánh giá của khách hàng ở đây sau khi họ hoàn thành sự kiện.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review._id} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={review.customerId?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.customerId?.name}`} 
                    alt={review.customerId?.name} 
                    className="w-10 h-10 rounded-full object-cover bg-white/10"
                  />
                  <div>
                    <h3 className="font-bold text-white">{review.customerId?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-slate-300 text-sm p-4 bg-white/5 rounded-xl">
                {review.comment || <span className="text-slate-500 italic">Không có bình luận.</span>}
              </div>

              {review.vendorReply ? (
                <div className="pl-6 border-l-2 border-cyan/30 pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-cyan text-sm font-bold">
                    <Reply className="w-4 h-4" />
                    Phản hồi của bạn
                    <span className="text-xs text-slate-400 font-normal ml-2">{new Date(review.repliedAt!).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-slate-300 bg-cyan/5 p-4 rounded-xl border border-cyan/10">
                    {review.vendorReply}
                  </p>
                </div>
              ) : (
                <div className="pl-6 pt-2">
                  <div className="flex items-start gap-3">
                    <textarea 
                      value={replyText[review._id] || ''}
                      onChange={(e) => setReplyText({...replyText, [review._id]: e.target.value})}
                      placeholder="Viết phản hồi cho khách hàng..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan min-h-[80px]"
                    />
                    <button 
                      onClick={() => handleReplySubmit(review._id)}
                      className="px-4 py-2 bg-cyan/20 text-cyan hover:bg-cyan hover:text-navy rounded-xl text-sm font-bold transition-colors whitespace-nowrap h-fit mt-1"
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
