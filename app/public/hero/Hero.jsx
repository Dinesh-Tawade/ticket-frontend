"use client";

import React, { useState, useEffect, useCallback } from "react";
import "@/app/i18n";
import { FaPlay, FaStar, FaTicketAlt, FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getPublicShows } from "@/app/services/publicCommunication";

function Hero() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState("next");
  const [isPaused, setIsPaused] = useState(false); // New: Pause auto-slide on hover

  // Touch handlers for mobile swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const { data: showsData, isLoading } = useQuery({
    queryKey: ["heroShows"],
    queryFn: getPublicShows,
  });

  const shows = showsData?.data || [];
  const heroMovies = shows.slice(0, 5).map((show) => ({
    id: show._id,
    title: show.movie?.name || "Movie",
    genre: show.movie?.genre || "",
    rating: show.movie?.rating || 0,
    image: show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    description: show.movie?.description || "",
    duration: show.movie?.duration,
    language: show.movie?.language,
    isTrending: show.movie?.isTrending,
    showId: show._id,
  }));

  const changeSlide = useCallback((newIndex, dir = "next") => {
    if (isTransitioning || heroMovies.length <= 1) return;
    setDirection(dir);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, heroMovies.length]);

  const nextSlide = () => changeSlide((currentSlide + 1) % heroMovies.length, "next");
  const prevSlide = () => changeSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length, "prev");

  // Auto-slide effect with Pause feature
  useEffect(() => {
    if (heroMovies.length > 1 && !isPaused) {
      const timer = setInterval(nextSlide, 7000);
      return () => clearInterval(timer);
    }
  }, [heroMovies.length, currentSlide, isTransitioning, isPaused]);

  // Touch Event Functions
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  const currentMovie = heroMovies[currentSlide] || {
    title: "Anant Vijay Auditorium",
    genre: "Premium Cinema Experience",
    rating: 0,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    description: "Book your tickets for the finest cinematic experiences in town.",
  };

  const renderStars = (rating) => {
    const stars = Math.round(rating / 2);
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < stars ? "text-amber-400 drop-shadow-md" : "text-white/30"}
        size={14}
      />
    ));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hero-section { font-family: 'DM Sans', sans-serif; }
        .hero-title { font-family: 'Playfair Display', serif; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .slide-bg { animation: scaleIn 10s ease-out forwards; }
        
        .hero-title-text {
          background: linear-gradient(135deg, #ffffff 0%, #f4d03f 50%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        /* Premium Gold Button */
        .book-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #d4af37, #aa7c11);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .book-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: all 0.5s ease;
        }
        .book-btn:hover::before { left: 100%; }
        .book-btn:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.5); 
        }

        /* Glassmorphism Trailer Button */
        .trailer-btn {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .trailer-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(212, 175, 55, 0.6);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .play-icon-wrap { position: relative; }
        .play-icon-wrap::after {
          content: ''; position: absolute; inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.6);
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .progress-bar {
          animation: progress 7s linear forwards;
          transform-origin: left;
        }
        .is-paused .progress-bar {
          animation-play-state: paused;
        }

        /* Movie Poster 3D Hover Effect */
        .movie-poster-card {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease;
        }
        .movie-poster-card:hover {
          transform: perspective(1000px) rotateY(-5deg) translateY(-10px);
          box-shadow: -20px 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2);
        }

        /* Subtle Bottom Gradient Line */
        .film-strip {
          position: absolute; bottom: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, transparent, #d4af37, #fff, #d4af37, transparent);
          opacity: 0.8;
          box-shadow: 0 -2px 15px rgba(212, 175, 55, 0.4);
        }
      `}</style>

      <section 
        className={`hero-section relative min-h-[100vh] flex items-end overflow-hidden bg-[#0a0a0a] ${isPaused ? 'is-paused' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Background Images with Improved Cinematic Overlays */}
        <div className="absolute inset-0">
          {heroMovies.length > 0 ? heroMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 1 : 0 }}
            >
              <div className="slide-bg w-full h-full" key={`bg-${currentSlide}`}>
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover object-top"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              {/* Richer Gradients for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent sm:via-black/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent h-full" />
            </div>
          )) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 w-full pb-12 pt-32 px-5 sm:px-10 lg:px-16 xl:px-24">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="max-w-2xl w-full space-y-6 lg:space-y-8 flex-shrink-0 z-20">

              {/* Progress & Slide Counter */}
              {heroMovies.length > 1 && (
                <div className="flex items-center gap-4 text-white/50">
                  <span className="font-mono text-sm tracking-[0.2em] font-semibold text-amber-400">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <div className="w-24 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-300 progress-bar" key={`progress-${currentSlide}`} />
                  </div>
                  <span className="font-mono text-sm tracking-[0.2em]">
                    {String(heroMovies.length).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3" key={`tags-${currentSlide}`} style={{ animation: "fadeSlideIn 0.6s 0.1s both" }}>
                {currentMovie.isTrending && (
                  <span className="bg-gradient-to-r from-red-600 to-red-500 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-xs font-bold tracking-widest uppercase shadow-lg shadow-red-500/30">
                    <FaFire size={12} className="animate-pulse" />
                    {t('hero.trending', 'Trending')}
                  </span>
                )}
                {currentMovie.genre && (
                  <span className="bg-amber-500/10 border border-amber-500/30 inline-flex items-center px-4 py-1.5 rounded-md text-amber-400 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">
                    {currentMovie.genre}
                  </span>
                )}
                {currentMovie.rating > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-0.5">
                      {renderStars(currentMovie.rating)}
                    </div>
                    <span className="text-white font-bold text-sm ml-1">{currentMovie.rating}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div key={`title-${currentSlide}`} style={{ animation: "fadeSlideIn 0.7s 0.15s both" }}>
                <h1 className="hero-title hero-title-text text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-black leading-[1.1] tracking-tight drop-shadow-2xl">
                  {currentMovie.title}
                </h1>
              </div>

              {/* Description */}
              {currentMovie.description && (
                <p
                  key={`desc-${currentSlide}`}
                  className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl font-light drop-shadow-md"
                  style={{ animation: "fadeSlideIn 0.7s 0.22s both" }}
                >
                  {currentMovie.description.length > 150
                    ? currentMovie.description.slice(0, 150) + "..."
                    : currentMovie.description}
                </p>
              )}

              {/* Meta Info (Duration & Language) */}
              {(currentMovie.duration || currentMovie.language) && (
                <div key={`meta-${currentSlide}`} className="flex items-center gap-4 text-sm text-gray-400 font-medium" style={{ animation: "fadeSlideIn 0.6s 0.28s both" }}>
                  {currentMovie.duration && (
                    <>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                        {currentMovie.duration} min
                      </span>
                      {currentMovie.language && <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
                    </>
                  )}
                  {currentMovie.language && (
                    <span className="uppercase tracking-widest text-xs border-b border-gray-600 pb-0.5">
                      {currentMovie.language}
                    </span>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div key={`btns-${currentSlide}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4" style={{ animation: "fadeSlideIn 0.7s 0.32s both" }}>
                <a
                  href={currentMovie.showId ? `/public/shows/${currentMovie.showId}` : "#shows"}
                  className="book-btn w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-base tracking-wide"
                >
                  <FaTicketAlt size={16} />
                  <span>{t('hero.bookTickets', 'Book Tickets')}</span>
                </a>
                
            
              </div>
            </div>

            {/* Right Content - Cinematic Poster */}
            {heroMovies.length > 0 && (
              <div className="hidden lg:block flex-shrink-0 z-20">
                <div
                  key={`poster-${currentSlide}`}
                  className="movie-poster-card relative rounded-2xl overflow-hidden border border-white/10 bg-black/50"
                  style={{
                    width: "300px",
                    height: "450px",
                    animation: "fadeSlideIn 0.8s 0.2s both"
                  }}
                >
                  <img
                    src={currentMovie.image}
                    alt={currentMovie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Overlay play button on poster */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer backdrop-blur-sm">
                     <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)] transform scale-90 hover:scale-100 transition-transform">
                        <FaPlay size={20} className="ml-1.5 text-white" />
                     </div>
                  </div>
                </div>

                {/* Desktop Navigation Arrows (Moved below poster for cleaner look) */}
                {heroMovies.length > 1 && (
                  <div className="flex justify-center gap-4 mt-8" style={{ animation: "fadeSlideIn 0.6s 0.4s both" }}>
                    <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-amber-500 hover:border-amber-500 transition-all duration-300 group">
                      <FaChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-amber-500 hover:border-amber-500 transition-all duration-300 group">
                      <FaChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Navigation controls (Visible only on small screens) */}
            {heroMovies.length > 1 && (
              <div className="lg:hidden w-full flex justify-between items-center z-20 pt-4 border-t border-white/10 mt-4">
                <button onClick={prevSlide} className="p-3 rounded-full bg-white/5 border border-white/10 text-white">
                  <FaChevronLeft size={14} />
                </button>
                <div className="flex gap-2">
                  {heroMovies.map((_, index) => (
                    <div key={index} className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-amber-500" : "w-1.5 bg-white/30"}`} />
                  ))}
                </div>
                <button onClick={nextSlide} className="p-3 rounded-full bg-white/5 border border-white/10 text-white">
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Bottom Accent Line */}
        <div className="film-strip z-30" />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex items-end pb-20 px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl w-full space-y-5 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded-full" />
              <div className="h-16 w-4/5 bg-white/10 rounded-xl" />
              <div className="h-20 w-3/5 bg-white/10 rounded-xl" />
              <div className="flex gap-4 pt-4">
                <div className="h-14 w-40 bg-amber-900/40 rounded-xl" />
                <div className="h-14 w-44 bg-white/10 rounded-xl" />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Hero;