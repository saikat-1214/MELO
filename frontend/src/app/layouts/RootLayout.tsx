import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/shared/components/Navbar';
import { Footer } from '@/shared/components/Footer';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F2] text-[#26232B]">
      <Navbar />
      <main className={`flex-1 w-full ${isLandingPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
