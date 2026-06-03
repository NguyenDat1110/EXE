import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import StepIndicator from '../components/booking/StepIndicator';
import BookingForm from '../components/booking/BookingForm';
import BookingSummary from '../components/booking/BookingSummary';
import BookingPayment from '../components/booking/BookingPayment';
import { createBooking, getVendorAvailability } from '../services/bookingsApi';
import { getBoothDetail, ExploreBoothPackage, ExploreBoothDetail, ExploreBoothDetailVendor } from '../services/exploreApi';

export default function BookingPage({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const navigate = useNavigate();
  const { boothId } = useParams();
  const [searchParams] = useSearchParams();
  const requestedPackageId = searchParams.get('packageId') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({});
  const [booth, setBooth] = useState<ExploreBoothDetail | null>(null);
  const [vendor, setVendor] = useState<ExploreBoothDetailVendor | null>(null);
  const [packages, setPackages] = useState<ExploreBoothPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(requestedPackageId);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedPackage = packages.find((pkg) => pkg._id === selectedPackageId) || null;

  useEffect(() => {
    const loadDetail = async () => {
      if (!boothId) return;
      setLoading(true);
      setError('');

      try {
        const result = await getBoothDetail(boothId);
        setBooth(result.booth);
        setVendor(result.vendor);
        setPackages(result.packages || []);

        const initialPackageId = requestedPackageId || result.packages?.[0]?._id || '';
        setSelectedPackageId(initialPackageId);
        setBookingData((prev: any) => ({
          ...prev,
          vendorId: result.vendor._id,
          boothId,
          packageId: initialPackageId,
          vendor: result.vendor,
          booth: result.booth
        }));

        const availability = await getVendorAvailability(result.vendor._id);
        setBlockedDates(availability?.data?.blockedDates || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải dữ liệu đặt lịch.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [boothId, requestedPackageId]);

  useEffect(() => {
    if (!selectedPackage || !vendor || !boothId) return;
    setBookingData((prev: any) => ({
      ...prev,
      packageId: selectedPackage._id,
      package: selectedPackage,
      vendorId: vendor._id,
      boothId,
      totalPrice: selectedPackage.price
    }));
  }, [selectedPackage, vendor, boothId]);

  const handleNext = async (data?: any) => {
    if (data) setBookingData((prev: any) => ({ ...prev, ...data }));

    if (currentStep === 2) {
      try {
        const payload = {
          ...bookingData,
          ...data,
          eventDate: data?.date || bookingData.eventDate || bookingData.date,
          numberOfGuests: data?.guests || bookingData.numberOfGuests || bookingData.guests,
          eventAddress: data?.eventAddress || bookingData.eventAddress || '',
          startTime: data?.startTime || bookingData.startTime || '',
          vendorId: vendor?._id,
          boothId,
          packageId: selectedPackage?._id,
          totalPrice: selectedPackage?.price ?? bookingData.totalPrice
        };

        const res = await createBooking(payload);
        const booking = res?.data?.booking;
        if (!booking) throw new Error('Booking creation failed');

        setBookingData((prev: any) => ({
          ...prev,
          bookingId: booking._id,
          status: booking.status,
          booking
        }));
        setCurrentStep(3);
      } catch (err: any) {
        console.error('Create booking error', err);
        return showToast(err?.response?.data?.message || err?.message || 'Không thể tạo booking', 'error');
      }
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark text-slate-100 flex items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 animate-pulse">Đang tải thông tin đặt lịch...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark text-slate-100 flex items-center justify-center px-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-400/10 p-8 text-sm text-red-200 max-w-2xl w-full">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col">
        <header className="sticky top-0 z-40 glass-card border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(`/booths/${boothId}`)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-widest">Quay Lại</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold tracking-widest font-manrope text-white">CLICKPICK</h2>
            </div>
            <div className="w-20" />
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif italic text-white mb-4">Đặt Lịch Dịch Vụ</h1>
            <p className="text-slate-400">{vendor?.name} - {selectedPackage?.name || 'Chọn gói dịch vụ'}</p>
          </div>

          <StepIndicator currentStep={currentStep} />

          <div className="mt-12">
            {currentStep === 1 && (
              <BookingForm
                onNext={handleNext}
                blockedDates={blockedDates}
                packageName={selectedPackage?.name}
                packageMinParticipants={selectedPackage?.minParticipants}
                packageMaxParticipants={selectedPackage?.maxParticipants}
              />
            )}
            {currentStep === 2 && <BookingSummary data={{ ...bookingData, package: selectedPackage, vendor }} onNext={() => handleNext()} onBack={handleBack} />}
            {currentStep === 3 && <BookingPayment bookingData={bookingData} />}
          </div>
        </main>
      </div>
    </>
  );
}
