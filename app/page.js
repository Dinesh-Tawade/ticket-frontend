"use client";

import React, { Suspense } from 'react';
import Hero from '@/app/public/hero/Hero';
import Show from '@/app/public/shows/Show';
import Header from './components/public/Header';
import Footer from './components/public/Footer';
import Newsletter from '@/app/public/newsletter/Newsletter';

function Page() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Header />
      <Hero />

      {/* 🔥 IMPORTANT FIX */}
      <Suspense fallback={<div>Loading shows...</div>}>
        <Show />
      </Suspense>

      <Newsletter />
      <Footer />
    </div>
  );
}

export default Page;