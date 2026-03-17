import React from 'react';
import HeroSection from '../components/home/HeroSection';
import IdeaGallery from '../components/home/IdeaGallery';
import HowItWorks from '../components/home/HowItWorks';
import VendorCTA from '../components/home/VendorCTA';

export default function LandingPage({ navigate }: { navigate: (page: string, params?: any) => void }) {
  return (
    <>
      <div className="grain-overlay"></div>
      <div className="relative flex flex-col w-full">
        <main className="flex-1 w-full">
          <HeroSection navigate={navigate} />
          <IdeaGallery navigate={navigate} />
          <HowItWorks />
          <VendorCTA navigate={navigate} />
        </main>
      </div>
    </>
  );
}
