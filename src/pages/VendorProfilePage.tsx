import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import VendorVisuals from '../components/vendor/VendorVisuals';
import VendorInfo from '../components/vendor/VendorInfo';
import StageViewer360 from '../components/features/StageViewer360';

export default function VendorProfilePage({ navigate, pageParams }: { navigate: (page: string, params?: any) => void, pageParams: any }) {
  const { vendorId } = pageParams;
  const [is360Open, setIs360Open] = useState(false);

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="min-h-screen bg-background-dark text-slate-100 pb-24 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-card border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('vendor-list')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
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
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
            <VendorVisuals onOpen360={() => setIs360Open(true)} />
            <VendorInfo navigate={navigate} vendorId={vendorId} />
          </div>
        </main>
      </div>

      {/* 360 Viewer Modal */}
      {is360Open && <StageViewer360 onClose={() => setIs360Open(false)} navigate={navigate} vendorId={vendorId} />}
    </>
  );
}
