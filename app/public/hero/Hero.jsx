// // "use client";

// // import React, { useState, useEffect } from "react";
// // import "@/app/i18n";
// // import {
// //   FaPlay,
// //   FaStar,
// //   FaTicketAlt,
// //   FaChevronLeft,
// //   FaChevronRight,
// //   FaClock,
// //   FaFire,
// // } from "react-icons/fa";
// // import { useTranslation } from "react-i18next";
// // import { useQuery } from "@tanstack/react-query";
// // import { getPublicShows } from "@/app/services/publicCommunication";

// // function Hero() {
// //   const { t } = useTranslation();
// //   const [currentSlide, setCurrentSlide] = useState(0);

// //   const { data: showsData, isLoading, error } = useQuery({
// //     queryKey: ["heroShows"],
// //     queryFn: getPublicShows,
// //   });

// //   const shows = showsData?.data || [];
// //   const heroMovies = shows.slice(0, 5).map((show) => ({
// //     id: show._id,
// //     title: show.movie?.name || "Movie",
// //     genre: show.movie?.genre || "",
// //     rating: show.movie?.rating || 8.5,
// //     image: show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
// //     description: show.movie?.description || "",
// //     duration: show.movie?.duration,
// //     language: show.movie?.language,
// //     isTrending: show.movie?.isTrending,
// //     showId: show._id,
// //   }));

// //   useEffect(() => {
// //     if (heroMovies.length > 0) {
// //       const timer = setInterval(() => {
// //         setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
// //       }, 6000);
// //       return () => clearInterval(timer);
// //     }
// //   }, [heroMovies.length]);

// //   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % (heroMovies.length || 1));
// //   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + (heroMovies.length || 1)) % (heroMovies.length || 1));

// //   const currentMovie = heroMovies[currentSlide] || {
// //     title: "Welcome to Anant Vijay Auditorium",
// //     genre: "",
// //     rating: 0,
// //     image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
// //     description: "Book your tickets for the best movies in town.",
// //   };

// //   return (
// //     <section className="relative min-h-[90vh] flex items-center overflow-hidden">
// //       {/* Background Image with Overlay */}
// //       <div className="absolute inset-0">
// //         {heroMovies.map((movie, index) => (
// //           <div
// //             key={movie.id}
// //             className={`absolute inset-0 transition-opacity duration-1000 ${
// //               index === currentSlide ? "opacity-100" : "opacity-0"
// //             }`}
// //           >
// //             <img
// //               src={movie.image}
// //               alt={movie.title}
// //               className="w-full h-full object-cover"
// //             />
// //             <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
// //           </div>
// //         ))}
// //       </div>

// //       {/* Content */}
// //       <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 pb-12">
// //         <div className="max-w-5xl mx-auto">
// //           <div className="flex flex-col items-center text-center">
            
// //             {/* Top Badge */}
// //             <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8 animate-fade-in">
// //               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
// //               <FaTicketAlt className="text-amber-400" size={14} />
// //               <span className="text-sm font-medium text-white/90 tracking-wide">Now Booking Open</span>
// //             </div>

// //             {/* Main Title with Gradient */}
// //             <h1 
// //               className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[1.1] tracking-tight"
// //               style={{
// //                 background: "linear-gradient(135deg, #ffffff 0%, #f4d03f 50%, #d4af37 100%)",
// //                 WebkitBackgroundClip: "text",
// //                 WebkitTextFillColor: "transparent",
// //                 textShadow: "0 0 80px rgba(212,175,55,0.3)",
// //               }}
// //             >
// //               {currentMovie.title}
// //             </h1>

// //             {/* Movie Meta Info */}
// //             <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
// //               {currentMovie.isTrending && (
// //                 <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">
// //                   <FaFire size={10} /> TRENDING NOW
// //                 </span>
// //               )}
// //               {currentMovie.rating > 0 && (
// //                 <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
// //                   <FaStar size={10} /> {currentMovie.rating}/10
// //                 </span>
// //               )}
// //               {currentMovie.genre && (
// //                 <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium">
// //                   {currentMovie.genre}
// //                 </span>
// //               )}
// //               {currentMovie.duration && (
// //                 <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium">
// //                   <FaClock size={10} /> {currentMovie.duration} min
// //                 </span>
// //               )}
// //               {currentMovie.language && (
// //                 <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium">
// //                   {currentMovie.language}
// //                 </span>
// //               )}
// //             </div>

// //             {/* Description */}
// //             <p className="text-lg sm:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
// //               {currentMovie.description || "Experience the magic of cinema at Anant Vijay Auditorium. Book your tickets now for an unforgettable movie experience."}
// //             </p>

// //             {/* Action Buttons */}
// //             <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
// //               <a
// //                 href={currentMovie.showId ? `/public/shows/${currentMovie.showId}` : "#shows"}
// //                 className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
// //                 style={{ background: "linear-gradient(135deg, #d4af37, #b8860b)" }}
// //               >
// //                 <FaTicketAlt className="group-hover:animate-bounce" />
// //                 Book Tickets Now
// //               </a>
// //               <button className="group inline-flex items-center gap-3 px-8 py-5 rounded-2xl font-semibold text-white bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 transition-all duration-300">
// //                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
// //                   <FaPlay className="text-sm ml-0.5" />
// //                 </div>
// //                 Watch Trailer
// //               </button>
// //             </div>

// //             {/* Slide Navigation Dots */}
// //             {heroMovies.length > 1 && (
// //               <div className="flex items-center gap-3">
// //                 <button
// //                   onClick={prevSlide}
// //                   className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
// //                 >
// //                   <FaChevronLeft size={14} />
// //                 </button>
// //                 <div className="flex items-center gap-2 px-4">
// //                   {heroMovies.map((movie, index) => (
// //                     <button
// //                       key={index}
// //                       onClick={() => setCurrentSlide(index)}
// //                       className="group relative"
// //                     >
// //                       <div className={`h-1.5 rounded-full transition-all duration-500 ${
// //                         index === currentSlide ? "w-12 bg-amber-400" : "w-1.5 bg-white/30 hover:bg-white/50"
// //                       }`} />
// //                       {index === currentSlide && (
// //                         <div className="absolute inset-0 h-1.5 rounded-full bg-amber-400 animate-pulse" />
// //                       )}
// //                     </button>
// //                   ))}
// //                 </div>
// //                 <button
// //                   onClick={nextSlide}
// //                   className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
// //                 >
// //                   <FaChevronRight size={14} />
// //                 </button>
// //               </div>
// //             )}

// //             {/* Scroll Indicator */}
// //             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
// //               <span className="text-xs tracking-widest uppercase">Scroll</span>
// //               <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
// //                 <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// // export default Hero;























// // current one









// // "use client";

// // import React, { useState, useEffect, useCallback } from "react";
// // import "@/app/i18n";
// // import { FaPlay, FaStar, FaTicketAlt, FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa";
// // import { useTranslation } from "react-i18next";
// // import { useQuery } from "@tanstack/react-query";
// // import { getPublicShows } from "@/app/services/publicCommunication";

// // function Hero() {
// //   const { t } = useTranslation();
// //   const [currentSlide, setCurrentSlide] = useState(0);
// //   const [isTransitioning, setIsTransitioning] = useState(false);
// //   const [direction, setDirection] = useState("next");

// //   const { data: showsData, isLoading } = useQuery({
// //     queryKey: ["heroShows"],
// //     queryFn: getPublicShows,
// //   });

// //   const shows = showsData?.data || [];
// //   const heroMovies = shows.slice(0, 5).map((show) => ({
// //     id: show._id,
// //     title: show.movie?.name || "Movie",
// //     genre: show.movie?.genre || "",
// //     rating: show.movie?.rating || 0,
// //     image: show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
// //     description: show.movie?.description || "",
// //     duration: show.movie?.duration,
// //     language: show.movie?.language,
// //     isTrending: show.movie?.isTrending,
// //     showId: show._id,
// //   }));

// //   const changeSlide = useCallback((newIndex, dir = "next") => {
// //     if (isTransitioning || heroMovies.length <= 1) return;
// //     setDirection(dir);
// //     setIsTransitioning(true);
// //     setTimeout(() => {
// //       setCurrentSlide(newIndex);
// //       setIsTransitioning(false);
// //     }, 500);
// //   }, [isTransitioning, heroMovies.length]);

// //   const nextSlide = () => changeSlide((currentSlide + 1) % heroMovies.length, "next");
// //   const prevSlide = () => changeSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length, "prev");

// //   useEffect(() => {
// //     if (heroMovies.length > 1) {
// //       const timer = setInterval(nextSlide, 7000);
// //       return () => clearInterval(timer);
// //     }
// //   }, [heroMovies.length, currentSlide, isTransitioning]);

// //   const currentMovie = heroMovies[currentSlide] || {
// //     title: "Anant Vijay Auditorium",
// //     genre: "Premium Cinema Experience",
// //     rating: 0,
// //     image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
// //     description: "Book your tickets for the finest cinematic experiences in town.",
// //   };

// //   const renderStars = (rating) => {
// //     const stars = Math.round(rating / 2);
// //     return Array.from({ length: 5 }, (_, i) => (
// //       <FaStar
// //         key={i}
// //         className={i < stars ? "text-amber-400" : "text-white/20"}
// //         size={12}
// //       />
// //     ));
// //   };

// //   return (
// //     <>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500&display=swap');

// //         .hero-section { font-family: 'DM Sans', sans-serif; }
// //         .hero-title { font-family: 'Playfair Display', serif; }

// //         @keyframes fadeSlideIn {
// //           from { opacity: 0; transform: translateY(24px); }
// //           to { opacity: 1; transform: translateY(0); }
// //         }
// //         @keyframes fadeSlideOut {
// //           from { opacity: 1; transform: translateY(0); }
// //           to { opacity: 0; transform: translateY(-16px); }
// //         }
// //         @keyframes scaleIn {
// //           from { transform: scale(1.08); }
// //           to { transform: scale(1); }
// //         }
// //         @keyframes shimmer {
// //           0% { background-position: -200% center; }
// //           100% { background-position: 200% center; }
// //         }
// //         @keyframes pulse-ring {
// //           0% { transform: scale(1); opacity: 0.8; }
// //           100% { transform: scale(1.5); opacity: 0; }
// //         }

// //         .slide-bg { animation: scaleIn 8s ease-out forwards; }
// //         .content-enter { animation: fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
// //         .content-exit { animation: fadeSlideOut 0.4s ease-in forwards; }

// //         .hero-title-text {
// //           background: linear-gradient(135deg, #fff 0%, #f4d03f 40%, #fff 100%);
// //           background-size: 200% auto;
// //           -webkit-background-clip: text;
// //           -webkit-text-fill-color: transparent;
// //           background-clip: text;
// //           animation: shimmer 4s linear infinite;
// //         }

// //         .book-btn {
// //           position: relative;
// //           overflow: hidden;
// //           background: linear-gradient(135deg, #d4af37, #b8860b);
// //           transition: all 0.3s ease;
// //         }
// //         .book-btn::before {
// //           content: '';
// //           position: absolute;
// //           inset: 0;
// //           background: linear-gradient(135deg, #f4d03f, #d4af37);
// //           opacity: 0;
// //           transition: opacity 0.3s ease;
// //         }
// //         .book-btn:hover::before { opacity: 1; }
// //         .book-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212, 175, 55, 0.5); }
// //         .book-btn span { position: relative; z-index: 1; }

// //         .trailer-btn {
// //           backdrop-filter: blur(12px);
// //           background: rgba(255,255,255,0.08);
// //           border: 1px solid rgba(255,255,255,0.2);
// //           transition: all 0.3s ease;
// //         }
// //         .trailer-btn:hover {
// //           background: rgba(255,255,255,0.15);
// //           border-color: rgba(255,255,255,0.4);
// //           transform: translateY(-2px);
// //         }

// //         .play-icon-wrap {
// //           position: relative;
// //         }
// //         .play-icon-wrap::after {
// //           content: '';
// //           position: absolute;
// //           inset: -4px;
// //           border-radius: 50%;
// //           border: 2px solid rgba(255,255,255,0.4);
// //           animation: pulse-ring 2s ease-out infinite;
// //         }

// //         .nav-dot {
// //           transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
// //           cursor: pointer;
// //         }
// //         .nav-dot.active { width: 28px; background: #d4af37; }
// //         .nav-dot.inactive { width: 6px; background: rgba(255,255,255,0.3); }
// //         .nav-dot.inactive:hover { background: rgba(255,255,255,0.6); }

// //         .nav-arrow {
// //           transition: all 0.3s ease;
// //           backdrop-filter: blur(8px);
// //           background: rgba(255,255,255,0.08);
// //           border: 1px solid rgba(255,255,255,0.15);
// //         }
// //         .nav-arrow:hover {
// //           background: rgba(212, 175, 55, 0.25);
// //           border-color: rgba(212, 175, 55, 0.5);
// //           transform: scale(1.1);
// //         }

// //         .progress-bar {
// //           animation: progress 7s linear forwards;
// //           transform-origin: left;
// //         }
// //         @keyframes progress {
// //           from { transform: scaleX(0); }
// //           to { transform: scaleX(1); }
// //         }

// //         .genre-tag {
// //           background: rgba(212, 175, 55, 0.15);
// //           border: 1px solid rgba(212, 175, 55, 0.35);
// //           color: #f4d03f;
// //         }

// //         .trending-badge {
// //           background: linear-gradient(135deg, #ef4444, #dc2626);
// //           animation: fadeSlideIn 0.5s 0.2s both;
// //         }

// //         .meta-divider {
// //           width: 3px;
// //           height: 3px;
// //           border-radius: 50%;
// //           background: rgba(255,255,255,0.35);
// //           display: inline-block;
// //         }

// //         .film-strip {
// //           position: absolute;
// //           bottom: 0;
// //           left: 0;
// //           right: 0;
// //           height: 3px;
// //           background: linear-gradient(90deg, transparent, #d4af37, #f4d03f, #d4af37, transparent);
// //           opacity: 0.6;
// //         }
// //       `}</style>

// //       <section className="hero-section relative min-h-[100vh] flex items-end overflow-hidden bg-black">

// //         {/* Background Images */}
// //         <div className="absolute inset-0">
// //           {heroMovies.length > 0 ? heroMovies.map((movie, index) => (
// //             <div
// //               key={movie.id}
// //               className="absolute inset-0 transition-opacity duration-700"
// //               style={{ opacity: index === currentSlide ? 1 : 0 }}
// //             >
// //               <div className="slide-bg w-full h-full" key={`bg-${currentSlide}`}>
// //                 <img
// //                   src={movie.image}
// //                   alt={movie.title}
// //                   className="w-full h-full object-cover"
// //                   loading={index === 0 ? "eager" : "lazy"}
// //                 />
// //               </div>
// //               {/* Multi-layer gradient overlay */}
// //               <div className="absolute inset-0" style={{
// //                 background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.2) 100%)"
// //               }} />
// //               <div className="absolute inset-0" style={{
// //                 background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.15) 100%)"
// //               }} />
// //             </div>
// //           )) : (
// //             <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
// //               <div className="absolute inset-0 opacity-10" style={{
// //                 backgroundImage: "repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)",
// //                 backgroundSize: "20px 20px"
// //               }} />
// //             </div>
// //           )}
// //         </div>

// //         {/* Ambient glow */}
// //         <div className="absolute bottom-0 left-0 w-2/3 h-1/2 pointer-events-none"
// //           style={{ background: "radial-gradient(ellipse at bottom left, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
// //         />

// //         {/* Main Content */}
// //         <div className="relative z-10 w-full pb-16 pt-32 px-6 sm:px-10 lg:px-16 xl:px-20">
// //           <div className="max-w-7xl mx-auto">
// //             <div className="max-w-2xl space-y-7">

// //               {/* Slide counter */}
// //               {heroMovies.length > 1 && (
// //                 <div className="flex items-center gap-3 text-white/40">
// //                   <span className="font-mono text-xs tracking-widest">
// //                     {String(currentSlide + 1).padStart(2, "0")}
// //                   </span>
// //                   <div className="w-16 h-px bg-white/20 relative overflow-hidden">
// //                     <div className="absolute inset-y-0 left-0 bg-amber-400 progress-bar" key={`progress-${currentSlide}`} />
// //                   </div>
// //                   <span className="font-mono text-xs tracking-widest">
// //                     {String(heroMovies.length).padStart(2, "0")}
// //                   </span>
// //                 </div>
// //               )}

// //               {/* Tags row */}
// //               <div
// //                 className="flex flex-wrap items-center gap-2"
// //                 key={`tags-${currentSlide}`}
// //                 style={{ animation: "fadeSlideIn 0.6s 0.1s both" }}
// //               >
// //                 {currentMovie.isTrending && (
// //                   <span className="trending-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide">
// //                     <FaFire size={10} />
// //                     TRENDING
// //                   </span>
// //                 )}
// //                 {currentMovie.genre && (
// //                   <span className="genre-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide">
// //                     {currentMovie.genre}
// //                   </span>
// //                 )}
// //                 {currentMovie.rating > 0 && (
// //                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10">
// //                     <div className="flex items-center gap-0.5">
// //                       {renderStars(currentMovie.rating)}
// //                     </div>
// //                     <span className="text-amber-400 font-bold text-xs">{currentMovie.rating}</span>
// //                     <span className="text-white/40 text-xs">/10</span>
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Title */}
// //               <div
// //                 key={`title-${currentSlide}`}
// //                 style={{ animation: "fadeSlideIn 0.7s 0.15s both" }}
// //               >
// //                 <h1 className="hero-title hero-title-text text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
// //                   {currentMovie.title}
// //                 </h1>
// //               </div>

// //               {/* Description */}
// //               {currentMovie.description && (
// //                 <p
// //                   key={`desc-${currentSlide}`}
// //                   className="text-white/65 text-base sm:text-lg leading-relaxed max-w-xl"
// //                   style={{ animation: "fadeSlideIn 0.7s 0.22s both" }}
// //                 >
// //                   {currentMovie.description.length > 140
// //                     ? currentMovie.description.slice(0, 140) + "…"
// //                     : currentMovie.description}
// //                 </p>
// //               )}

// //               {/* Meta info */}
// //               {(currentMovie.duration || currentMovie.language) && (
// //                 <div
// //                   key={`meta-${currentSlide}`}
// //                   className="flex items-center gap-3 text-sm text-white/50"
// //                   style={{ animation: "fadeSlideIn 0.6s 0.28s both" }}
// //                 >
// //                   {currentMovie.duration && (
// //                     <>
// //                       <span className="font-medium">{currentMovie.duration} min</span>
// //                       {currentMovie.language && <span className="meta-divider" />}
// //                     </>
// //                   )}
// //                   {currentMovie.language && (
// //                     <span className="font-medium uppercase tracking-wider text-xs">
// //                       {currentMovie.language}
// //                     </span>
// //                   )}
// //                 </div>
// //               )}

// //               {/* Action buttons */}
// //               <div
// //                 key={`btns-${currentSlide}`}
// //                 className="flex flex-wrap items-center gap-3 pt-2"
// //                 style={{ animation: "fadeSlideIn 0.7s 0.32s both" }}
// //               >
// //                 <a
// //                   href={currentMovie.showId ? `/public/shows/${currentMovie.showId}` : "#shows"}
// //                   className="book-btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide"
// //                 >
// //                   <FaTicketAlt size={14} />
// //                   <span>Book Tickets</span>
// //                 </a>
// //                 <button className="trailer-btn inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white text-sm">
// //                   <div className="play-icon-wrap w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
// //                     <FaPlay size={8} className="ml-0.5" />
// //                   </div>
// //                   Watch Trailer
// //                 </button>
// //               </div>

// //               {/* Slide navigation */}
// //               {heroMovies.length > 1 && (
// //                 <div
// //                   className="flex items-center gap-4 pt-4"
// //                   style={{ animation: "fadeSlideIn 0.6s 0.4s both" }}
// //                 >
// //                   <button onClick={prevSlide} className="nav-arrow w-10 h-10 rounded-full flex items-center justify-center text-white">
// //                     <FaChevronLeft size={13} />
// //                   </button>
// //                   <div className="flex items-center gap-1.5">
// //                     {heroMovies.map((_, index) => (
// //                       <button
// //                         key={index}
// //                         onClick={() => !isTransitioning && setCurrentSlide(index)}
// //                         className={`nav-dot h-1.5 rounded-full ${index === currentSlide ? "active" : "inactive"}`}
// //                       />
// //                     ))}
// //                   </div>
// //                   <button onClick={nextSlide} className="nav-arrow w-10 h-10 rounded-full flex items-center justify-center text-white">
// //                     <FaChevronRight size={13} />
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Film strip accent */}
// //         <div className="film-strip" />

// //         {/* Loading skeleton */}
// //         {isLoading && (
// //           <div className="absolute inset-0 z-20 bg-black flex items-end pb-16 px-6 sm:px-10 lg:px-16">
// //             <div className="max-w-2xl w-full space-y-4 animate-pulse">
// //               <div className="h-3 w-20 bg-white/10 rounded-full" />
// //               <div className="h-14 w-4/5 bg-white/10 rounded-lg" />
// //               <div className="h-14 w-3/5 bg-white/10 rounded-lg" />
// //               <div className="h-4 w-full bg-white/8 rounded" />
// //               <div className="h-4 w-2/3 bg-white/8 rounded" />
// //               <div className="flex gap-3 pt-2">
// //                 <div className="h-12 w-36 bg-amber-900/30 rounded-xl" />
// //                 <div className="h-12 w-40 bg-white/8 rounded-xl" />
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </section>
// //     </>
// //   );
// // }

// // export default Hero;






// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import "@/app/i18n";
// import { FaPlay, FaStar, FaTicketAlt, FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa";
// import { useTranslation } from "react-i18next";
// import { useQuery } from "@tanstack/react-query";
// import { getPublicShows } from "@/app/services/publicCommunication";

// function Hero() {
//   const { t } = useTranslation();
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [direction, setDirection] = useState("next");

//   const { data: showsData, isLoading } = useQuery({
//     queryKey: ["heroShows"],
//     queryFn: getPublicShows,
//   });

//   const shows = showsData?.data || [];
//   const heroMovies = shows.slice(0, 5).map((show) => ({
//     id: show._id,
//     title: show.movie?.name || "Movie",
//     genre: show.movie?.genre || "",
//     rating: show.movie?.rating || 0,
//     image: show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
//     description: show.movie?.description || "",
//     duration: show.movie?.duration,
//     language: show.movie?.language,
//     isTrending: show.movie?.isTrending,
//     showId: show._id,
//   }));

//   const changeSlide = useCallback((newIndex, dir = "next") => {
//     if (isTransitioning || heroMovies.length <= 1) return;
//     setDirection(dir);
//     setIsTransitioning(true);
//     setTimeout(() => {
//       setCurrentSlide(newIndex);
//       setIsTransitioning(false);
//     }, 500);
//   }, [isTransitioning, heroMovies.length]);

//   const nextSlide = () => changeSlide((currentSlide + 1) % heroMovies.length, "next");
//   const prevSlide = () => changeSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length, "prev");

//   useEffect(() => {
//     if (heroMovies.length > 1) {
//       const timer = setInterval(nextSlide, 7000);
//       return () => clearInterval(timer);
//     }
//   }, [heroMovies.length, currentSlide, isTransitioning]);

//   const currentMovie = heroMovies[currentSlide] || {
//     title: "Anant Vijay Auditorium",
//     genre: "Premium Cinema Experience",
//     rating: 0,
//     image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
//     description: "Book your tickets for the finest cinematic experiences in town.",
//   };

//   const renderStars = (rating) => {
//     const stars = Math.round(rating / 2);
//     return Array.from({ length: 5 }, (_, i) => (
//       <FaStar
//         key={i}
//         className={i < stars ? "text-amber-400" : "text-white/20"}
//         size={12}
//       />
//     ));
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500&display=swap');

//         .hero-section { font-family: 'DM Sans', sans-serif; }
//         .hero-title { font-family: 'Playfair Display', serif; }

//         @keyframes fadeSlideIn {
//           from { opacity: 0; transform: translateY(24px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeSlideOut {
//           from { opacity: 1; transform: translateY(0); }
//           to { opacity: 0; transform: translateY(-16px); }
//         }
//         @keyframes scaleIn {
//           from { transform: scale(1.06); }
//           to { transform: scale(1); }
//         }
//         @keyframes shimmer {
//           0% { background-position: -200% center; }
//           100% { background-position: 200% center; }
//         }
//         @keyframes pulse-ring {
//           0% { transform: scale(1); opacity: 0.8; }
//           100% { transform: scale(1.5); opacity: 0; }
//         }
//         @keyframes posterIn {
//           from { opacity: 0; transform: translateX(32px) scale(0.96); }
//           to { opacity: 1; transform: translateX(0) scale(1); }
//         }

//         .slide-bg-blur {
//           animation: scaleIn 8s ease-out forwards;
//           filter: blur(12px) brightness(0.38) saturate(1.15);
//           transform: scale(1.12);
//         }

//         .content-enter { animation: fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

//         .hero-title-text {
//           background: linear-gradient(135deg, #fff 0%, #f4d03f 40%, #fff 100%);
//           background-size: 200% auto;
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           animation: shimmer 4s linear infinite;
//         }

//         .book-btn {
//           position: relative;
//           overflow: hidden;
//           background: linear-gradient(135deg, #d4af37, #b8860b);
//           transition: all 0.3s ease;
//         }
//         .book-btn::before {
//           content: '';
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(135deg, #f4d03f, #d4af37);
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }
//         .book-btn:hover::before { opacity: 1; }
//         .book-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212, 175, 55, 0.5); }
//         .book-btn span { position: relative; z-index: 1; }

//         .trailer-btn {
//           backdrop-filter: blur(12px);
//           background: rgba(255,255,255,0.08);
//           border: 1px solid rgba(255,255,255,0.2);
//           transition: all 0.3s ease;
//         }
//         .trailer-btn:hover {
//           background: rgba(255,255,255,0.15);
//           border-color: rgba(255,255,255,0.4);
//           transform: translateY(-2px);
//         }

//         .play-icon-wrap {
//           position: relative;
//         }
//         .play-icon-wrap::after {
//           content: '';
//           position: absolute;
//           inset: -4px;
//           border-radius: 50%;
//           border: 2px solid rgba(255,255,255,0.4);
//           animation: pulse-ring 2s ease-out infinite;
//         }

//         .nav-dot {
//           transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
//           cursor: pointer;
//         }
//         .nav-dot.active { width: 28px; background: #d4af37; }
//         .nav-dot.inactive { width: 6px; background: rgba(255,255,255,0.3); }
//         .nav-dot.inactive:hover { background: rgba(255,255,255,0.6); }

//         .nav-arrow {
//           transition: all 0.3s ease;
//           backdrop-filter: blur(8px);
//           background: rgba(255,255,255,0.08);
//           border: 1px solid rgba(255,255,255,0.15);
//         }
//         .nav-arrow:hover {
//           background: rgba(212, 175, 55, 0.25);
//           border-color: rgba(212, 175, 55, 0.5);
//           transform: scale(1.1);
//         }

//         .progress-bar {
//           animation: progress 7s linear forwards;
//           transform-origin: left;
//         }
//         @keyframes progress {
//           from { transform: scaleX(0); }
//           to { transform: scaleX(1); }
//         }

//         .genre-tag {
//           background: rgba(212, 175, 55, 0.15);
//           border: 1px solid rgba(212, 175, 55, 0.35);
//           color: #f4d03f;
//         }

//         .trending-badge {
//           background: linear-gradient(135deg, #ef4444, #dc2626);
//           animation: fadeSlideIn 0.5s 0.2s both;
//         }

//         .meta-divider {
//           width: 3px;
//           height: 3px;
//           border-radius: 50%;
//           background: rgba(255,255,255,0.35);
//           display: inline-block;
//         }

//         .film-strip {
//           position: absolute;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           height: 3px;
//           background: linear-gradient(90deg, transparent, #d4af37, #f4d03f, #d4af37, transparent);
//           opacity: 0.6;
//         }

//         /* Poster card */
//         .poster-card {
//           border-radius: 16px;
//           overflow: hidden;
//           box-shadow:
//             0 0 0 1px rgba(255,255,255,0.08),
//             0 32px 80px rgba(0,0,0,0.7),
//             0 0 60px rgba(212,175,55,0.12);
//           transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease;
//         }
//         .poster-card:hover {
//           transform: translateY(-6px) scale(1.015);
//           box-shadow:
//             0 0 0 1px rgba(212,175,55,0.2),
//             0 40px 100px rgba(0,0,0,0.75),
//             0 0 80px rgba(212,175,55,0.2);
//         }
//         .poster-card img {
//           display: block;
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
//         .poster-enter {
//           animation: posterIn 0.65s cubic-bezier(0.22,1,0.36,1) both;
//         }
//       `}</style>

//       <section className="hero-section relative min-h-[100vh] flex items-end overflow-hidden bg-black">

//         {/* Blurred Background Images */}
//         <div className="absolute inset-0 overflow-hidden">
//           {heroMovies.length > 0 ? heroMovies.map((movie, index) => (
//             <div
//               key={movie.id}
//               className="absolute inset-0 transition-opacity duration-700"
//               style={{ opacity: index === currentSlide ? 1 : 0 }}
//             >
//               <div className="slide-bg-blur w-full h-full" key={`bg-${currentSlide}`}>
//                 <img
//                   src={movie.image}
//                   alt=""
//                   aria-hidden="true"
//                   className="w-full h-full object-cover"
//                   loading={index === 0 ? "eager" : "lazy"}
//                 />
//               </div>
//             </div>
//           )) : (
//             <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
//               <div className="absolute inset-0 opacity-10" style={{
//                 backgroundImage: "repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)",
//                 backgroundSize: "20px 20px"
//               }} />
//             </div>
//           )}

//           {/* Gradient overlays on top of blur */}
//           <div className="absolute inset-0" style={{
//             background: "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%)"
//           }} />
//           <div className="absolute inset-0" style={{
//             background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 100%)"
//           }} />
//         </div>

//         {/* Ambient glow */}
//         <div className="absolute bottom-0 left-0 w-2/3 h-1/2 pointer-events-none"
//           style={{ background: "radial-gradient(ellipse at bottom left, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
//         />

//         {/* Main Content */}
//         <div className="relative z-10 w-full pb-16 pt-32 px-6 sm:px-10 lg:px-16 xl:px-20">
//           <div className="max-w-7xl mx-auto flex items-end justify-between gap-10">

//             {/* LEFT: Text content */}
//             <div className="max-w-xl w-full space-y-7 flex-shrink-0">

//               {/* Slide counter */}
//               {heroMovies.length > 1 && (
//                 <div className="flex items-center gap-3 text-white/40">
//                   <span className="font-mono text-xs tracking-widest">
//                     {String(currentSlide + 1).padStart(2, "0")}
//                   </span>
//                   <div className="w-16 h-px bg-white/20 relative overflow-hidden">
//                     <div className="absolute inset-y-0 left-0 bg-amber-400 progress-bar" key={`progress-${currentSlide}`} />
//                   </div>
//                   <span className="font-mono text-xs tracking-widest">
//                     {String(heroMovies.length).padStart(2, "0")}
//                   </span>
//                 </div>
//               )}

//               {/* Tags row */}
//               <div
//                 className="flex flex-wrap items-center gap-2"
//                 key={`tags-${currentSlide}`}
//                 style={{ animation: "fadeSlideIn 0.6s 0.1s both" }}
//               >
//                 {currentMovie.isTrending && (
//                   <span className="trending-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide">
//                     <FaFire size={10} />
//                     TRENDING
//                   </span>
//                 )}
//                 {currentMovie.genre && (
//                   <span className="genre-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide">
//                     {currentMovie.genre}
//                   </span>
//                 )}
//                 {currentMovie.rating > 0 && (
//                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10">
//                     <div className="flex items-center gap-0.5">
//                       {renderStars(currentMovie.rating)}
//                     </div>
//                     <span className="text-amber-400 font-bold text-xs">{currentMovie.rating}</span>
//                     <span className="text-white/40 text-xs">/10</span>
//                   </div>
//                 )}
//               </div>

//               {/* Title */}
//               <div key={`title-${currentSlide}`} style={{ animation: "fadeSlideIn 0.7s 0.15s both" }}>
//                 <h1 className="hero-title hero-title-text text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
//                   {currentMovie.title}
//                 </h1>
//               </div>

//               {/* Description */}
//               {currentMovie.description && (
//                 <p
//                   key={`desc-${currentSlide}`}
//                   className="text-white/65 text-base sm:text-lg leading-relaxed"
//                   style={{ animation: "fadeSlideIn 0.7s 0.22s both" }}
//                 >
//                   {currentMovie.description.length > 140
//                     ? currentMovie.description.slice(0, 140) + "…"
//                     : currentMovie.description}
//                 </p>
//               )}

//               {/* Meta info */}
//               {(currentMovie.duration || currentMovie.language) && (
//                 <div
//                   key={`meta-${currentSlide}`}
//                   className="flex items-center gap-3 text-sm text-white/50"
//                   style={{ animation: "fadeSlideIn 0.6s 0.28s both" }}
//                 >
//                   {currentMovie.duration && (
//                     <>
//                       <span className="font-medium">{currentMovie.duration} min</span>
//                       {currentMovie.language && <span className="meta-divider" />}
//                     </>
//                   )}
//                   {currentMovie.language && (
//                     <span className="font-medium uppercase tracking-wider text-xs">
//                       {currentMovie.language}
//                     </span>
//                   )}
//                 </div>
//               )}

//               {/* Action buttons */}
//               <div
//                 key={`btns-${currentSlide}`}
//                 className="flex flex-wrap items-center gap-3 pt-2"
//                 style={{ animation: "fadeSlideIn 0.7s 0.32s both" }}
//               >
//                 <a
//                   href={currentMovie.showId ? `/public/shows/${currentMovie.showId}` : "#shows"}
//                   className="book-btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide"
//                 >
//                   <FaTicketAlt size={14} />
//                   <span>Book Tickets</span>
//                 </a>
//                 <button className="trailer-btn inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white text-sm">
//                   <div className="play-icon-wrap w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
//                     <FaPlay size={8} className="ml-0.5" />
//                   </div>
//                   Watch Trailer
//                 </button>
//               </div>

//               {/* Slide navigation */}
//               {heroMovies.length > 1 && (
//                 <div
//                   className="flex items-center gap-4 pt-4"
//                   style={{ animation: "fadeSlideIn 0.6s 0.4s both" }}
//                 >
//                   <button onClick={prevSlide} className="nav-arrow w-10 h-10 rounded-full flex items-center justify-center text-white">
//                     <FaChevronLeft size={13} />
//                   </button>
//                   <div className="flex items-center gap-1.5">
//                     {heroMovies.map((_, index) => (
//                       <button
//                         key={index}
//                         onClick={() => !isTransitioning && setCurrentSlide(index)}
//                         className={`nav-dot h-1.5 rounded-full ${index === currentSlide ? "active" : "inactive"}`}
//                       />
//                     ))}
//                   </div>
//                   <button onClick={nextSlide} className="nav-arrow w-10 h-10 rounded-full flex items-center justify-center text-white">
//                     <FaChevronRight size={13} />
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* RIGHT: Poster */}
//             {heroMovies.length > 0 && (
//               <div
//                 className="hidden lg:flex flex-1 items-end justify-center pb-2"
//                 style={{ animation: "fadeSlideIn 0.7s 0.2s both" }}
//               >
//                 <div
//                   key={`poster-${currentSlide}`}
//                   className="poster-card poster-enter"
//                   style={{
//                     width: "300px",
//                     height: "460px",
//                   }}
//                 >
//                   <img
//                     src={currentMovie.image}
//                     alt={currentMovie.title}
//                     loading="lazy"
//                   />
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>

//         {/* Film strip accent */}
//         <div className="film-strip" />

//         {/* Loading skeleton */}
//         {isLoading && (
//           <div className="absolute inset-0 z-20 bg-black flex items-end pb-16 px-6 sm:px-10 lg:px-16">
//             <div className="max-w-2xl w-full space-y-4 animate-pulse">
//               <div className="h-3 w-20 bg-white/10 rounded-full" />
//               <div className="h-14 w-4/5 bg-white/10 rounded-lg" />
//               <div className="h-14 w-3/5 bg-white/10 rounded-lg" />
//               <div className="h-4 w-full bg-white/8 rounded" />
//               <div className="h-4 w-2/3 bg-white/8 rounded" />
//               <div className="flex gap-3 pt-2">
//                 <div className="h-12 w-36 bg-amber-900/30 rounded-xl" />
//                 <div className="h-12 w-40 bg-white/8 rounded-xl" />
//               </div>
//             </div>
//           </div>
//         )}
//       </section>
//     </>
//   );
// }

// export default Hero;



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

  useEffect(() => {
    if (heroMovies.length > 1) {
      const timer = setInterval(nextSlide, 7000);
      return () => clearInterval(timer);
    }
  }, [heroMovies.length, currentSlide, isTransitioning]);

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
        className={i < stars ? "text-amber-400" : "text-white/20"}
        size={12}
      />
    ));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        .hero-section { font-family: 'DM Sans', sans-serif; }
        .hero-title { font-family: 'Playfair Display', serif; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-16px); }
        }
        @keyframes scaleIn {
          from { transform: scale(1.08); }
          to { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .slide-bg { animation: scaleIn 8s ease-out forwards; }
        .content-enter { animation: fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .content-exit { animation: fadeSlideOut 0.4s ease-in forwards; }

        .hero-title-text {
          background: linear-gradient(135deg, #fff 0%, #f4d03f 40%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .book-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          transition: all 0.3s ease;
        }
        .book-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f4d03f, #d4af37);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .book-btn:hover::before { opacity: 1; }
        .book-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212, 175, 55, 0.5); }
        .book-btn span { position: relative; z-index: 1; }

        .trailer-btn {
          backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .trailer-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-2px);
        }

        .play-icon-wrap {
          position: relative;
        }
        .play-icon-wrap::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          animation: pulse-ring 2s ease-out infinite;
        }

        .nav-dot {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .nav-dot.active { width: 28px; background: #d4af37; }
        .nav-dot.inactive { width: 6px; background: rgba(255,255,255,0.3); }
        .nav-dot.inactive:hover { background: rgba(255,255,255,0.6); }

        .nav-arrow {
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .nav-arrow:hover {
          background: rgba(212, 175, 55, 0.25);
          border-color: rgba(212, 175, 55, 0.5);
          transform: scale(1.1);
        }

        .progress-bar {
          animation: progress 7s linear forwards;
          transform-origin: left;
        }
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .genre-tag {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #f4d03f;
        }

        .trending-badge {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          animation: fadeSlideIn 0.5s 0.2s both;
        }

        .meta-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          display: inline-block;
        }

        .film-strip {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #d4af37, #f4d03f, #d4af37, transparent);
          opacity: 0.6;
        }
      `}</style>

      <section className="hero-section relative min-h-[100vh] flex items-end overflow-hidden bg-black">

        {/* Background Images */}
        <div className="absolute inset-0">
          {heroMovies.length > 0 ? heroMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: index === currentSlide ? 1 : 0 }}
            >
              <div className="slide-bg w-full h-full" key={`bg-${currentSlide}`}>
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              {/* Multi-layer gradient overlay */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.2) 100%)"
              }} />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.15) 100%)"
              }} />
            </div>
          )) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)",
                backgroundSize: "20px 20px"
              }} />
            </div>
          )}
        </div>

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-0 w-2/3 h-1/2 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
        />

        {/* Main Content */}
        <div className="relative z-10 w-full pb-16 pt-32 px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="max-w-7xl mx-auto flex items-end justify-between gap-10">
            <div className="max-w-xl w-full space-y-7 flex-shrink-0">

              {/* Slide counter */}
              {heroMovies.length > 1 && (
                <div className="flex items-center gap-3 text-white/40">
                  <span className="font-mono text-xs tracking-widest">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <div className="w-16 h-px bg-white/20 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-amber-400 progress-bar" key={`progress-${currentSlide}`} />
                  </div>
                  <span className="font-mono text-xs tracking-widest">
                    {String(heroMovies.length).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Tags row */}
              <div
                className="flex flex-wrap items-center gap-2"
                key={`tags-${currentSlide}`}
                style={{ animation: "fadeSlideIn 0.6s 0.1s both" }}
              >
                {currentMovie.isTrending && (
                  <span className="trending-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide">
                    <FaFire size={10} />
                    TRENDING
                  </span>
                )}
                {currentMovie.genre && (
                  <span className="genre-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                    {currentMovie.genre}
                  </span>
                )}
                {currentMovie.rating > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10">
                    <div className="flex items-center gap-0.5">
                      {renderStars(currentMovie.rating)}
                    </div>
                    <span className="text-amber-400 font-bold text-xs">{currentMovie.rating}</span>
                    <span className="text-white/40 text-xs">/10</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div
                key={`title-${currentSlide}`}
                style={{ animation: "fadeSlideIn 0.7s 0.15s both" }}
              >
                <h1 className="hero-title hero-title-text text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
                  {currentMovie.title}
                </h1>
              </div>

              {/* Description */}
              {currentMovie.description && (
                <p
                  key={`desc-${currentSlide}`}
                  className="text-white/65 text-base sm:text-lg leading-relaxed max-w-xl"
                  style={{ animation: "fadeSlideIn 0.7s 0.22s both" }}
                >
                  {currentMovie.description.length > 140
                    ? currentMovie.description.slice(0, 140) + "…"
                    : currentMovie.description}
                </p>
              )}

              {/* Meta info */}
              {(currentMovie.duration || currentMovie.language) && (
                <div
                  key={`meta-${currentSlide}`}
                  className="flex items-center gap-3 text-sm text-white/50"
                  style={{ animation: "fadeSlideIn 0.6s 0.28s both" }}
                >
                  {currentMovie.duration && (
                    <>
                      <span className="font-medium">{currentMovie.duration} min</span>
                      {currentMovie.language && <span className="meta-divider" />}
                    </>
                  )}
                  {currentMovie.language && (
                    <span className="font-medium uppercase tracking-wider text-xs">
                      {currentMovie.language}
                    </span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div
                key={`btns-${currentSlide}`}
                className="flex flex-wrap items-center gap-3 pt-2"
                style={{ animation: "fadeSlideIn 0.7s 0.32s both" }}
              >
                <a
                  href={currentMovie.showId ? `/public/shows/${currentMovie.showId}` : "#shows"}
                  className="book-btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide"
                >
                  <FaTicketAlt size={14} />
                  <span>Book Tickets</span>
                </a>
                <button className="trailer-btn inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white text-sm">
                  <div className="play-icon-wrap w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                    <FaPlay size={8} className="ml-0.5" />
                  </div>
                  Watch Trailer
                </button>
              </div>

              {/* Slide navigation */}
              {heroMovies.length > 1 && (
                <div
                  className="flex items-center gap-4 pt-4"
                  style={{ animation: "fadeSlideIn 0.6s 0.4s both" }}
                >
                  <button onClick={prevSlide} className="nav-arrow w-10 h-10 rounded-full flex items-center justify-center text-white">
                    <FaChevronLeft size={13} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {heroMovies.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => !isTransitioning && setCurrentSlide(index)}
                        className={`nav-dot h-1.5 rounded-full ${index === currentSlide ? "active" : "inactive"}`}
                      />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="nav-arrow w-10 h-10 rounded-full flex items-center justify-center text-white">
                    <FaChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Movie Poster - Right Side */}
            {heroMovies.length > 0 && (
              <div className="hidden lg:block flex-shrink-0">
                <div
                  key={`poster-${currentSlide}`}
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    width: "280px",
                    height: "420px",
                    animation: "fadeSlideIn 0.7s 0.2s both"
                  }}
                >
                  <img
                    src={currentMovie.image}
                    alt={currentMovie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Film strip accent */}
        <div className="film-strip" />

        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-black flex items-end pb-16 px-6 sm:px-10 lg:px-16">
            <div className="max-w-2xl w-full space-y-4 animate-pulse">
              <div className="h-3 w-20 bg-white/10 rounded-full" />
              <div className="h-14 w-4/5 bg-white/10 rounded-lg" />
              <div className="h-14 w-3/5 bg-white/10 rounded-lg" />
              <div className="h-4 w-full bg-white/8 rounded" />
              <div className="h-4 w-2/3 bg-white/8 rounded" />
              <div className="flex gap-3 pt-2">
                <div className="h-12 w-36 bg-amber-900/30 rounded-xl" />
                <div className="h-12 w-40 bg-white/8 rounded-xl" />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Hero;