import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, MapPin, Phone, Star } from 'lucide-react';
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

  if (loading) {
    return <div className="h-72 rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse" />;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>;
  }

  if (!booth || !vendor) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-silver/70">
        Không có dữ liệu gian hàng.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/explore" className="inline-flex items-center text-cyan text-sm hover:underline">
        Quay lại Explore
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="relative h-72 md:h-96 bg-slate-custom">
          {booth.coverImage ? (
            <img src={booth.coverImage} alt={booth.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-silver/50">No cover image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan/90 mb-2">{booth.eventType}</p>
            <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">{booth.name}</h1>
            {selectedPackage && (
              <p className="mt-4 max-w-2xl text-silver/80 text-sm md:text-base">Gói chọn: <span className="font-semibold text-white">{selectedPackage.name}</span> — {toCurrency(selectedPackage.price)} | Đặt cọc {toCurrency(selectedPackage.depositAmount)}</p>
            )}
          </div>
        </div>

        <div className="p-6 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl glass-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-silver/70">Thông tin gói dịch vụ</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{selectedPackage?.name || 'Chọn gói dịch vụ'}</h2>
                </div>
                <div className="rounded-2xl bg-navy/70 px-4 py-3 text-right">
                  <p className="text-sm text-silver/70">Giá trọn gói</p>
                  <p className="text-2xl font-semibold text-cyan">{selectedPackage ? toCurrency(selectedPackage.price) : '...'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-silver/70">Đặt cọc</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedPackage ? toCurrency(selectedPackage.depositAmount) : '...'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-silver/70">Thời lượng</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedPackage?.serviceDuration ? formatDuration(selectedPackage.serviceDuration) : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-silver/70">Số người tối thiểu</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedPackage?.minParticipants ? `${selectedPackage.minParticipants} người` : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-silver/70">Số người tối đa</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedPackage?.maxParticipants ? `${selectedPackage.maxParticipants} người` : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="mt-6 text-silver/80 leading-relaxed">
                <p>{selectedPackage?.description || 'Chọn một gói dịch vụ bên dưới để xem chi tiết và ảnh minh họa.'}</p>
              </div>

              {selectedPackage ? (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-silver/70 mb-3">Bao gồm</p>
                  {selectedPackage.includedServices && selectedPackage.includedServices.length > 0 ? (
                    <ul className="space-y-2 text-silver/80 text-sm">
                      {selectedPackage.includedServices.map((service, index) => (
                        <li key={`${service}-${index}`} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-cyan" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-silver/60">Chưa có thông tin dịch vụ đi kèm.</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm uppercase tracking-[0.16em] text-silver/70 mb-4">Lựa chọn gói</p>
              {packages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-silver/60">
                  Gian hàng chưa có package khả dụng.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg._id}
                      onClick={() => setSelectedPackageId(pkg._id)}
                      className={`rounded-3xl border p-4 text-left transition-colors ${
                        selectedPackageId === pkg._id
                          ? 'border-cyan/50 bg-cyan/10'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold text-white">{pkg.name}</h3>
                        <span className="text-sm text-silver/70">{pkg.serviceDuration ? formatDuration(pkg.serviceDuration) : 'N/A'}</span>
                      </div>
                      <p className="mt-3 text-cyan font-semibold">{toCurrency(pkg.price)}</p>
                      <p className="mt-2 text-xs text-silver/70">Đặt cọc: {toCurrency(pkg.depositAmount)}</p>
                      <p className="mt-1 text-xs text-silver/70">
                        {pkg.minParticipants > 0 || pkg.maxParticipants > 0
                          ? `Số người: ${pkg.minParticipants || '?'} - ${pkg.maxParticipants || '?'}`
                          : 'Số người: Chưa cập nhật'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPackageImages.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-silver/70 mb-4">Ảnh gói đã chọn</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedPackageImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="h-36 rounded-3xl overflow-hidden border border-white/10 bg-slate-custom">
                      <img src={image} alt={`${selectedPackage?.name} ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-white">Đánh giá từ khách hàng</h3>
                  <p className="text-xs text-silver/60 mt-1">Những nhận xét thực tế từ khách hàng đã trải nghiệm dịch vụ.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <span className="text-lg font-bold text-white">
                    {vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-sm text-silver/60">({reviews.length} đánh giá)</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-silver/50 text-sm">
                  Chưa có đánh giá nào cho nhà cung cấp này.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.customerId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.customerId?._id}`}
                            alt={rev.customerId?.name}
                            className="w-10 h-10 rounded-full border border-white/10 object-cover"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-white">{rev.customerId?.name || 'Khách hàng'}</h4>
                            <p className="text-xs text-silver/50">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2.5 py-1 rounded-full text-yellow-400 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{rev.rating} ★</span>
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-sm text-silver/80 pl-1">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-cyan/30 bg-slate-custom">
                  <img
                    src={vendor.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=vendor'}
                    alt={vendor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-silver/70">Nhà cung cấp</p>
                  <h3 className="text-xl font-semibold text-white">{vendor.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-yellow-300">
                <Star className="h-4 w-4 fill-current" />
                <span>{vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : 'N/A'}</span>
                <span className="text-silver/60">({vendor.reviewCount} đánh giá)</span>
              </div>
              <p className="text-sm text-silver/75 leading-relaxed">{vendor.description || 'Nhà cung cấp chưa cập nhật thông tin.'}</p>
              <div className="rounded-3xl bg-navy/80 p-4 text-sm text-silver/70 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan" />
                  <span>{vendor.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan" />
                  <span>{contactUnlocked ? (vendor.phone || 'Chưa cập nhật số điện thoại') : 'Liên hệ sẽ được mở khi booking được xác nhận.'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan" />
                  <span>{contactUnlocked ? (vendor.email || 'Chưa cập nhật email') : 'Email nhà cung cấp bị ẩn cho đến khi booking xác nhận.'}</span>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-custom p-4 border border-white/10">
                <p className="text-sm uppercase tracking-[0.16em] text-silver/70">Hỗ trợ tổ chức</p>
                <p className="mt-2 text-white font-medium">Đội ngũ chuyên viên sự kiện của chúng tôi luôn hỗ trợ bạn lập kế hoạch chi tiết A-Z.</p>
                <p className="text-sm text-silver/70">Liên hệ nhanh: <span className="text-cyan">1900 8888</span></p>
              </div>
              <div className="grid gap-3">
                <Link
                  to={`/booths/${booth._id}/book?packageId=${selectedPackageId}`}
                  className="block rounded-2xl bg-cyan px-4 py-3 text-center text-sm font-semibold text-navy transition hover:bg-cyan/90"
                >
                  Đặt lịch ngay
                </Link>
                <a
                  href={contactUnlocked ? `mailto:${vendor.email}?subject=Tư vấn gói ${encodeURIComponent(selectedPackage?.name || booth.name)}` : '#'}
                  onClick={(e) => {
                    if (!contactUnlocked) e.preventDefault();
                  }}
                  className={`block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold transition ${
                    contactUnlocked ? 'text-white hover:border-cyan/40 hover:text-cyan' : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Liên hệ tư vấn
                </a>
              </div>
              <Link
                to={`/vendor/${vendor._id}`}
                className="block rounded-2xl bg-cyan px-4 py-3 text-center text-sm font-semibold text-navy transition hover:bg-cyan/90"
              >
                Xem chi tiết nhà cung cấp
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
