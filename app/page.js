"use client";
import React from 'react'
import Hero from '@/app/public/hero/Hero';
import Show from '@/app/public/shows/Show';
import Header from './components/public/Header';
import Footer from './components/public/Footer';


function page() {
  return (
    <div>
    <Header/>
     <Hero/>
     <Show/> 
     <Footer/>
    </div>
  )
}

export default page
