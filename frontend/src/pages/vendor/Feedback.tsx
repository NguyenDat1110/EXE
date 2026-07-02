import React, { useEffect, useState } from 'react';
import { Star, Loader2, MessageSquare, CheckCircle, Send } from 'lucide-react';
import api from '../../services/api';
import { getVendorReviews, replyToReview, ReviewItem } from '../../services/reviewApi';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function VendorFeedback() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const vendorRes = await api.get('/vendor/info');
      const vendor = vendorRes.data?.vendor;
      setAverageRating(vendor?.averageRating || 0);
      if (vendor?._id) {
        const data = await getVendorReviews(vendor._id);
        setReviews(data);
      }
    } catch {
      setError('Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    const reply = (replyDrafts[reviewId] || '').trim();
    if (!reply) return;

    setSubmittingId(reviewId);
    setError('');
    try {
      await replyToReview(reviewId, reply);
      setSuccess('Đã gửi phản hồi đến khách hàng!');
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
      await fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Đánh Giá &amp; Góp Ý Từ Khách Hàng</h1>
          <p className="text-silver text-sm">Xem và phản hồi trải nghiệm khách hàng đã chia sẻ sau sự kiện</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <Star className="w-5 h-5 fill-current text-yellow-400" />
          <span className="text-lg font-bold text-white">{averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}</span>
          <span className="text-sm text-silver/60">({reviews.length} đánh giá)</span>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-cyan/10 border border-cyan/30 rounded-xl text-cyan text-sm">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg">Chưa có đánh giá nào</p>
          <p className="text-white/30 text-sm mt-1">Đánh giá từ khách hàng sẽ xuất hiện ở đây sau khi sự kiện hoàn tất.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customerId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.customerId?._id}`}
                    alt={rev.customerId?.name}
                    className="w-10 h-10 rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{rev.customerId?.name || 'Khách hàng'}</h4>
                    <p className="text-xs text-silver/50">{formatDate(rev.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400/10 px-2.5 py-1 rounded-full text-yellow-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{rev.rating} ★</span>
                </div>
              </div>

              {rev.comment && (
                <p className="text-sm text-silver/80 pl-1 whitespace-pre-wrap">{rev.comment}</p>
              )}

              {rev.vendorReply ? (
                <div className="ml-4 border-l-2 border-cyan/30 pl-4 py-1 bg-cyan/5 rounded-r-xl">
                  <p className="text-xs font-semibold text-cyan mb-1">Phản hồi của bạn</p>
                  <p className="text-sm text-silver/80 whitespace-pre-wrap">{rev.vendorReply}</p>
                  {rev.vendorRepliedAt && (
                    <p className="text-xs text-silver/40 mt-1">{formatDate(rev.vendorRepliedAt)}</p>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyDrafts[rev._id] || ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [rev._id]: e.target.value }))}
                    placeholder="Viết phản hồi cảm ơn hoặc giải đáp góp ý của khách hàng..."
                    maxLength={1000}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan/50"
                  />
                  <button
                    onClick={() => handleReply(rev._id)}
                    disabled={submittingId === rev._id || !(replyDrafts[rev._id] || '').trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan text-navy rounded-xl font-semibold text-sm hover:bg-cyan/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submittingId === rev._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Gửi
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
