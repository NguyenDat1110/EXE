import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, MapPin, Phone, Star, ChevronRight, CheckCircle2, Building, ShieldCheck, Users, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExploreBoothPackage,
  getBoothDetail,
  ExploreBoothDetail as BoothDetailModel,
  ExploreBoothDetailVendor
} from '../../services/exploreApi';
import { getMyBookings } from '../../services/bookingsApi';
import { useAuthStore } from '../../store/authStore';
import { getVendorReviews } from '../../services/reviewApi';

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
          className={`w-4 h-4 ${
            rating >= star
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
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải chi tiết gian hàng.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [boothId, user]);

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
      {galleryImages.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-4 ${galleryImages.length === 1 ? 'grid-rows-1' : 'grid-rows-2'} gap-2 h-[400px] md:h-[500px] rounded-3xl overflow-hidden`}>
          <div className={`${
            galleryImages.length === 1 ? 'md:col-span-4' : 
            galleryImages.length === 2 ? 'md:col-span-3' : 
            'md:col-span-2'
          } ${galleryImages.length === 1 ? 'row-span-1' : 'row-span-2'} relative group cursor-pointer`}>
            <img src={galleryImages[0]} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>
          {galleryImages.slice(1, 5).map((img, idx) => (
            <div key={idx} className={`relative hidden md:block group cursor-pointer overflow-hidden ${
              galleryImages.length === 2 ? 'md:col-span-1 row-span-2' : ''
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
        <div className="space-y-12">
          
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Giới thiệu về không gian</h2>
            <div className="text-silver/80 leading-relaxed whitespace-pre-wrap text-lg">
              {booth.description || 'Chưa có thông tin mô tả chi tiết cho gian hàng này.'}
            </div>
          </section>

          <hr className="border-white/10" />

          {/* Packages */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Các gói dịch vụ</h2>
            
            {/* Package Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
              {packages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => setSelectedPackageId(pkg._id)}
                  className={`px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    selectedPackageId === pkg._id 
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
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {selectedPackageImages.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`${selectedPackage.name} ${idx + 1}`} 
                            className="w-64 h-48 object-cover rounded-2xl shrink-0 snap-start border border-white/10"
                          />
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
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg ${
                selectedPackageId 
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
              className={`block w-full text-center py-3 rounded-xl text-sm font-semibold border transition-colors ${
                contactUnlocked 
                  ? 'border-cyan text-cyan hover:bg-cyan/10' 
                  : 'border-white/10 text-white/30 cursor-not-allowed bg-white/5'
              }`}
            >
              Liên hệ nhà cung cấp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
