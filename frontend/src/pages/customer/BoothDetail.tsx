import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, MapPin, Phone, Star, ChevronRight, CheckCircle2, Building, ShieldCheck, Users, Clock, Info, Compass, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import { useStageBuilderStore } from '../../store/stageBuilderStore';

const ThreeDViewer = React.lazy(() => import('../../components/features/stage-builder/ThreeDViewer'));
import {
  ExploreBoothPackage,
  getBoothDetail,
  ExploreBoothDetail as BoothDetailModel,
  ExploreBoothDetailVendor
} from '../../services/exploreApi';
import { getMyBookings } from '../../services/bookingsApi';
import { useAuthStore } from '../../store/authStore';
import { getVendorReviews, createReview } from '../../services/reviewApi';

const toCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value || 0);

const formatDuration = (durationMinutes?: string | number | null) => {
  const totalMinutes = durationMinutes ? Number(durationMinutes) : 0;
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${rating >= star
            ? 'fill-yellow-400 text-yellow-400'
            : rating >= star - 0.5
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-transparent text-silver/30'
            }`}
        />
      ))}
    </div>
  );
}

export default function BoothDetail() {
  const { boothId } = useParams();

  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendor, setVendor] = useState<ExploreBoothDetailVendor | null>(null);
  const [booth, setBooth] = useState<BoothDetailModel | null>(null);
  const [packages, setPackages] = useState<ExploreBoothPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
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
  const showPrevLightbox = () => setLightbox((prev) => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
  const showNextLightbox = () => setLightbox((prev) => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);

  useEffect(() => {
    if (!boothId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await getBoothDetail(boothId);
        setVendor(result.vendor);
        setBooth(result.booth);
        setPackages(result.packages || []);
        setSelectedPackageId(result.packages?.[0]?._id || '');

        if (result.vendor?._id) {
          try {
            const reviewResult = await getVendorReviews(result.vendor._id);
            setReviews(reviewResult || []);
          } catch (reviewErr) {
            console.error('Failed to load reviews:', reviewErr);
          }
        }

        if (user && result.vendor?._id) {
          try {
            const bookingResult = await getMyBookings({ vendorId: result.vendor._id, status: 'confirmed' });
            const bookings = bookingResult?.data?.bookings || [];
            setContactUnlocked(bookings.length > 0);
          } catch {
            setContactUnlocked(false);
          }

          try {
            const completedResult = await getMyBookings();
            const allBookings = completedResult?.data?.bookings || [];
            const unreviewed = allBookings.filter(
              (b: any) =>
                String(b.vendor?._id) === String(result.vendor?._id) &&
                b.status === 'completed' &&
                !b.isReviewed
            );
            setCompletedBookings(unreviewed);
          } catch (e) {
            console.error('Failed to load completed bookings:', e);
            setCompletedBookings([]);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải chi tiết gian hàng.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [boothId, user]);

  const handleReviewSubmit = async () => {
    if (completedBookings.length === 0) return;
    const targetBooking = completedBookings[0];
    setReviewSubmitting(true);
    try {
      await createReview({
        bookingId: targetBooking._id,
        rating: reviewRating,
        comment: reviewComment
      });
      // reload reviews
      if (vendor?._id) {
        const reviewResult = await getVendorReviews(vendor._id);
        setReviews(reviewResult || []);
        
        // update average rating
        const totalRating = (reviewResult || []).reduce((acc: number, curr: any) => acc + curr.rating, 0);
        const count = (reviewResult || []).length;
        setVendor((prev: any) => prev ? {
          ...prev,
          averageRating: count > 0 ? totalRating / count : 0,
          reviewCount: count
        } : null);
      }
      setCompletedBookings(prev => prev.slice(1));
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const selectedPackage = useMemo(
    () => packages.find((item) => item._id === selectedPackageId) || null,
    [packages, selectedPackageId]
  );

  const selectedPackageImages = selectedPackage?.images || [];
  const galleryImages = [booth?.coverImage, ...(booth?.gallery || [])].filter(Boolean) as string[];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded-lg w-64" />
        <div className="h-[500px] bg-white/5 rounded-3xl" />
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div className="h-[400px] bg-white/5 rounded-3xl" />
          <div className="h-[400px] bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !booth || !vendor) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-12 text-center flex flex-col items-center">
        <Info className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Đã xảy ra lỗi</h3>
        <p className="text-red-200">{error || 'Không tìm thấy dữ liệu gian hàng.'}</p>
        <Link to="/explore" className="mt-6 px-6 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">Quay lại Explore</Link>
      </div>
    );
  }

  // Rating Distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length
  }));
  const maxRatingCount = Math.max(...ratingCounts.map(r => r.count), 1);

  return (
    <div className="space-y-8 pb-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-silver/60">
        <Link to="/explore" className="hover:text-cyan transition-colors">Explore</Link>
        <ChevronRight className="w-4 h-4" />
        {booth.category && (
          <>
            <Link to={`/explore/${booth.category}`} className="hover:text-cyan transition-colors capitalize">
              {booth.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-white truncate max-w-[200px] md:max-w-xs">{booth.name}</span>
      </nav>

      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-cyan/10 text-cyan text-xs font-bold uppercase tracking-widest rounded-full border border-cyan/20">
            {booth.eventType}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-full border border-yellow-400/20">
            <Star className="w-3.5 h-3.5 fill-current" />
            {vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'Mới'}
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4">{booth.name}</h1>
        <div className="flex items-center gap-2 text-silver/80">
          <MapPin className="w-4 h-4 text-cyan" />
          <span>{booth.address}</span>
        </div>
      </div>

      {/* Image Mosaic Gallery */}
      {
        galleryImages.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-4 ${galleryImages.length === 1 ? 'grid-rows-1' : 'grid-rows-2'} gap-2 h-[400px] md:h-[500px] rounded-3xl overflow-hidden`}>
            <div
              onClick={() => openLightbox(galleryImages, 0)}
              className={`${galleryImages.length === 1 ? 'md:col-span-4' :
                galleryImages.length === 2 ? 'md:col-span-3' :
                  'md:col-span-2'
                } ${galleryImages.length === 1 ? 'row-span-1' : 'row-span-2'} relative group cursor-pointer`}>
              <img src={galleryImages[0]} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(galleryImages, idx + 1)}
                className={`relative hidden md:block group cursor-pointer overflow-hidden ${galleryImages.length === 2 ? 'md:col-span-1 row-span-2' : ''
                  }`}>
                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                {idx === 3 && galleryImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{galleryImages.length - 5} ảnh</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start relative">

        {/* Left Column: Details */}
        <div className="space-y-12 min-w-0">

          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Giới thiệu về không gian</h2>
            <div className="text-silver/80 leading-relaxed whitespace-pre-wrap text-lg">
              {booth.description || 'Chưa có thông tin mô tả chi tiết cho gian hàng này.'}
            </div>
          </section>

          <hr className="border-white/10" />

          {/* Packages */}
          <section id="packages-section">
            <h2 className="text-2xl font-bold text-white mb-6">Các gói dịch vụ</h2>

            {/* Package Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
              {packages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => setSelectedPackageId(pkg._id)}
                  className={`px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedPackageId === pkg._id
                    ? 'bg-white text-navy shadow-lg scale-105 transform origin-bottom'
                    : 'bg-white/5 text-silver hover:bg-white/10 border border-white/10'
                    }`}
                >
                  {pkg.name}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedPackage && (
                <motion.div
                  key={selectedPackage._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-3">{selectedPackage.name}</h3>
                      <p className="text-silver/70 max-w-xl">{selectedPackage.description}</p>
                      {selectedPackage.stageLayout && selectedPackage.stageLayout.length > 0 && (
                        <button
                          onClick={() => handleOpen3D(selectedPackage.stageLayout!)}
                          className="mt-4 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan/20 to-purple-500/20 hover:from-cyan/30 hover:to-purple-500/30 text-cyan text-sm font-bold rounded-xl border border-cyan/30 hover:border-cyan/50 transition-all shadow-[0_0_15px_rgba(0,212,255,0.15)] group"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse group-hover:bg-purple-400 transition-colors" />
                          Trải nghiệm 3D
                        </button>
                      )}
                    </div>
                    <div className="bg-cyan/10 border border-cyan/20 p-4 rounded-2xl md:text-right shrink-0">
                      <p className="text-sm font-semibold text-cyan uppercase tracking-wider mb-1">Trọn gói từ</p>
                      <p className="text-3xl font-bold text-white">{toCurrency(selectedPackage.price)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
                      <Clock className="w-5 h-5 text-cyan" />
                      <span className="text-xs text-silver/60 uppercase">Thời lượng</span>
                      <span className="font-semibold text-white">{selectedPackage.serviceDuration ? formatDuration(selectedPackage.serviceDuration) : '--'}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
                      <Users className="w-5 h-5 text-cyan" />
                      <span className="text-xs text-silver/60 uppercase">Tối đa</span>
                      <span className="font-semibold text-white">{selectedPackage.maxParticipants ? `${selectedPackage.maxParticipants} người` : '--'}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
                      <Building className="w-5 h-5 text-cyan" />
                      <span className="text-xs text-silver/60 uppercase">Tối thiểu</span>
                      <span className="font-semibold text-white">{selectedPackage.minParticipants ? `${selectedPackage.minParticipants} người` : '--'}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
                      <ShieldCheck className="w-5 h-5 text-cyan" />
                      <span className="text-xs text-silver/60 uppercase">Cọc trước</span>
                      <span className="font-semibold text-white">{toCurrency(selectedPackage.depositAmount)}</span>
                    </div>
                  </div>

                  {selectedPackage.includedServices && selectedPackage.includedServices.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                      <h4 className="font-bold text-white mb-4">Dịch vụ bao gồm</h4>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {selectedPackage.includedServices.map((service, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-silver/90">
                            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPackageImages.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-white mb-4">Hình ảnh minh họa</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedPackageImages.slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(selectedPackageImages, idx)}
                            className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
                          >
                            <img
                              src={img}
                              alt={`${selectedPackage.name} ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {idx === 3 && selectedPackageImages.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-white font-bold text-xl">+{selectedPackageImages.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <hr className="border-white/10" />

          {/* Reviews */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'Chưa có đánh giá'}
                <span className="text-lg text-silver/50 font-normal ml-2">({reviews.length} đánh giá)</span>
              </h2>
            </div>

            {/* Review Submission Form / Status Notice */}
            {completedBookings.length > 0 ? (
              <div className="mb-10 p-6 bg-white/[0.02] border border-white/10 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Đánh giá trải nghiệm của bạn</h3>
                  <p className="text-sm text-silver/60">Bạn đã hoàn tất đặt lịch dịch vụ từ vendor này. Hãy để lại đánh giá của bạn nhé!</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = reviewHoverRating !== null ? star <= reviewHoverRating : star <= reviewRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(null)}
                          className="p-1 focus:outline-none transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-8 h-8 transition-all duration-300 ${isFilled ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-600'
                              }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-sm font-bold tracking-widest uppercase text-cyan bg-cyan/10 px-3 py-1 rounded-full border border-cyan/20 ml-2">
                      {reviewRating === 5 && 'Tuyệt vời!'}
                      {reviewRating === 4 && 'Rất tốt'}
                      {reviewRating === 3 && 'Bình thường'}
                      {reviewRating === 2 && 'Kém'}
                      {reviewRating === 1 && 'Rất tệ'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Viết nhận xét của bạn để giúp người khác đưa ra quyết định tốt hơn..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-silver/30 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all resize-none text-sm"
                    />
                  </div>

                  <button
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-cyan text-navy font-bold uppercase tracking-wider hover:bg-cyan/90 disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.2)] self-start"
                  >
                    {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-10 p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl flex flex-col items-center text-center gap-2">
                <Info className="w-8 h-8 text-cyan/60" />
                <p className="text-silver/80 text-sm font-medium">Bạn muốn đánh giá nhà cung cấp này?</p>
                <p className="text-xs text-silver/50 max-w-lg leading-relaxed">
                  Để đảm bảo tính trung thực và khách quan, ClickPick chỉ cho phép những tài khoản đã thực hiện đặt lịch và hoàn tất sử dụng dịch vụ (Trạng thái: Completed) gửi đánh giá.
                </p>
                {!user ? (
                  <Link
                    to="/login"
                    className="mt-2 text-xs font-bold text-cyan hover:underline uppercase tracking-wider"
                  >
                    Đăng nhập để đặt lịch ngay &rarr;
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const element = document.getElementById('packages-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="mt-2 text-xs font-bold text-cyan hover:underline uppercase tracking-wider"
                  >
                    Xem các gói dịch vụ & Đặt lịch &rarr;
                  </button>
                )}
              </div>
            )}

            {reviews.length > 0 && (
              <div className="grid md:grid-cols-[1fr_2fr] gap-8 mb-10 items-center">
                <div className="space-y-3">
                  {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-3">{star}</span>
                      <Star className="w-3.5 h-3.5 text-silver/40" />
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${(count / maxRatingCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-silver/80 text-sm">
                  <span className="font-bold text-white block mb-2">Thông tin minh bạch</span>
                  100% đánh giá đều từ khách hàng đã trải nghiệm và thanh toán qua nền tảng.
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan/40 to-blue-600/40 p-0.5">
                        <img
                          src={rev.customerId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.customerId?._id}`}
                          alt={rev.customerId?.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{rev.customerId?.name || 'Khách hàng'}</p>
                        <p className="text-xs text-silver/50">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} />
                  </div>

                  {rev.comment && <p className="text-silver/90 text-sm leading-relaxed">{rev.comment}</p>}

                  {rev.vendorReply && (
                    <div className="mt-4 p-4 bg-cyan/5 border border-cyan/10 rounded-2xl rounded-tl-none">
                      <p className="text-xs font-bold text-cyan mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Phản hồi từ Vendor
                      </p>
                      <p className="text-sm text-silver/80">{rev.vendorReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <aside className="lg:sticky top-24 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Tóm tắt đơn đặt</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-silver/70">Gói đã chọn</span>
                <span className="font-semibold text-white max-w-[150px] text-right truncate">{selectedPackage?.name || '--'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-silver/70">Giá trọn gói</span>
                <span className="font-bold text-white">{selectedPackage ? toCurrency(selectedPackage.price) : '--'}</span>
              </div>
              <div className="flex justify-between text-sm py-3 border-y border-white/10">
                <span className="text-silver/70 font-medium">Đặt cọc ngay</span>
                <span className="font-bold text-cyan text-lg">{selectedPackage ? toCurrency(selectedPackage.depositAmount) : '--'}</span>
              </div>
              <div className="flex justify-between text-sm text-silver/50">
                <span>Còn lại thanh toán sau</span>
                <span>{selectedPackage ? toCurrency(selectedPackage.price - selectedPackage.depositAmount) : '--'}</span>
              </div>
            </div>

            <Link
              to={`/booths/${booth._id}/book?packageId=${selectedPackageId}`}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg ${selectedPackageId
                ? 'bg-cyan text-navy hover:bg-cyan/90 shadow-cyan/20 hover:shadow-cyan/40'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              onClick={(e) => { if (!selectedPackageId) e.preventDefault(); }}
            >
              Tiếp tục đặt lịch <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-xs text-silver/50 mt-4">Bạn chưa bị trừ tiền ở bước này.</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <img
                src={vendor.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${vendor._id}`}
                alt={vendor.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-silver/50">Nhà cung cấp</p>
                <Link to={`/vendor/${vendor._id}`} className="font-bold text-white hover:text-cyan transition-colors line-clamp-1">{vendor.name}</Link>
                <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                  <Star className="w-3 h-3 fill-current" /> {vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'Mới'}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-silver/80">
                <MapPin className="w-4 h-4 text-cyan" />
                <span className="truncate">{vendor.address || 'Chưa cập nhật địa chỉ'}</span>
              </div>
              <div className="flex items-center gap-3 text-silver/80">
                <Phone className="w-4 h-4 text-cyan" />
                <span>{contactUnlocked ? vendor.phone || '--' : 'Bảo mật (Chờ đặt cọc)'}</span>
              </div>
              <div className="flex items-center gap-3 text-silver/80">
                <Mail className="w-4 h-4 text-cyan" />
                <span className="truncate">{contactUnlocked ? vendor.email || '--' : 'Bảo mật (Chờ đặt cọc)'}</span>
              </div>
            </div>

            <a
              href={contactUnlocked ? `mailto:${vendor.email}?subject=Tư vấn gói ${encodeURIComponent(selectedPackage?.name || booth.name)}` : '#'}
              onClick={(e) => { if (!contactUnlocked) e.preventDefault(); }}
              className={`block w-full text-center py-3 rounded-xl text-sm font-semibold border transition-colors ${contactUnlocked
                ? 'border-cyan text-cyan hover:bg-cyan/10'
                : 'border-white/10 text-white/30 cursor-not-allowed bg-white/5'
                }`}
            >
              Liên hệ nhà cung cấp
            </a>
          </div>
        </aside>
      </div>

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onPrev={showPrevLightbox}
          onNext={showNextLightbox}
        />
      )}

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
                  <h3 className="text-base font-bold text-white">{selectedPackage?.name || 'Sân khấu mẫu'}</h3>
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
                    {selectedPackage ? toCurrency(selectedPackage.price) : '--'}
                  </span>
                  <button
                    onClick={() => {
                      handleClose3D();
                      const element = document.getElementById('packages-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-5 py-2 bg-cyan text-navy hover:bg-cyan/90 font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
                  >
                    Đóng & Đặt lịch
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
