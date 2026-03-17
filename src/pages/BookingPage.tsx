import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import StepIndicator from '../components/booking/StepIndicator';
import BookingForm from '../components/booking/BookingForm';
import BookingSummary from '../components/booking/BookingSummary';
import PaymentStep from '../components/booking/PaymentStep';

export default function BookingPage({ navigate, pageParams, showToast }: { navigate: (page: string, params?: any) => void, pageParams: any, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const { vendorId } = pageParams;
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({});

  const handleNext = (data?: any) => {
    if (data) setBookingData({ ...bookingData, ...data });
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-card border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('vendor-detail', { vendorId })} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
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
            <div className="w-20" /> {/* Spacer */}
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif italic text-white mb-4">Đặt Lịch Dịch Vụ</h1>
            <p className="text-slate-400">Lumina Events - Gói Siêu Cấp (Luxury)</p>
          </div>

          <StepIndicator currentStep={currentStep} />

          <div className="mt-12">
            {currentStep === 1 && <BookingForm onNext={handleNext} />}
            {currentStep === 2 && <BookingSummary data={bookingData} onNext={() => handleNext()} onBack={handleBack} />}
            {currentStep === 3 && <PaymentStep navigate={navigate} showToast={showToast} />}
          </div>
        </main>
      </div>
    </>
  );
}
