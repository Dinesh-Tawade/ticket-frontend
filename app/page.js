"use client";
import React from 'react'
import Hero from '@/app/public/hero/Hero';
import Show from '@/app/public/shows/Show';
import Header from './components/public/Header';
import Footer from './components/public/Footer';
import Features from '@/app/public/features/Features';
import Newsletter from '@/app/public/newsletter/Newsletter';

function page() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Header/>
      <Hero/>
      <Features/>
      <Show/>
      <Newsletter/>
      <Footer/>
    </div>
  )
}

export default page
