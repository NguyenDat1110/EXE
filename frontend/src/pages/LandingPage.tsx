import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import IdeaGallery from '../components/home/IdeaGallery';
import HowItWorks from '../components/home/HowItWorks';
import VendorCTA from '../components/home/VendorCTA';

export default function LandingPage() {
  const routerNavigate = useNavigate();

  // Adapter for existing components expecting the custom navigate prop
  const navigateAdapter = (page: string, params?: any) => {
    if (page === 'vendor-list') {
      routerNavigate('/explore');
    } else if (page === 'login') {
      routerNavigate('/login');
    } else if (page === 'vendor-dashboard') {
      routerNavigate('/vendor/dashboard');
    } else if (page === 'admin-dashboard') {
      routerNavigate('/admin/dashboard');
    } else {
      routerNavigate('/');
    }
  };

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="relative flex flex-col w-full">
        <main className="flex-1 w-full">
          <HeroSection navigate={navigateAdapter} />
          <IdeaGallery navigate={navigateAdapter} />
          <HowItWorks />
          <VendorCTA navigate={navigateAdapter} />
        </main>
      </div>
    </>
  );
}
