import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import IdeaGallery from '../components/home/IdeaGallery';
import HowItWorks from '../components/home/HowItWorks';
import VendorCTA from '../components/home/VendorCTA';
import Testimonials from '../components/home/Testimonials';
import FeaturedServices from '../components/home/FeaturedServices';

export default function LandingPage() {
  const routerNavigate = useNavigate();

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
      <div className="relative flex flex-col w-full overflow-x-hidden">
        <main className="flex-1 w-full">
          <HeroSection navigate={navigateAdapter} />
          <FeaturedServices navigate={navigateAdapter} />
          <IdeaGallery navigate={navigateAdapter} />
          <HowItWorks />
          <Testimonials />
          <VendorCTA navigate={navigateAdapter} />
        </main>
      </div>
    </>
  );
}
