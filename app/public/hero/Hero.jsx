"use client";

import React, { useState, useEffect } from "react";
import "@/app/i18n";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
  FaPlay,
  FaStar,
  FaTicketAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

const heroMovies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    genre: "Action, Sci-Fi",
    rating: 9.2,
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80",
    description: "After the devastating events of Infinity War, the universe is in ruins."
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action, Crime, Drama",
    rating: 9.0,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
    description: "When the menace known as the Joker wreaks havoc on Gotham City."
  },
  {
    id: 3,
    title: "Inception",
    genre: "Sci-Fi, Thriller",
    rating: 8.8,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    description: "A thief who steals corporate secrets through dream-sharing technology."
  }
];

function Hero() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);

  const currentMovie = heroMovies[currentSlide];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {heroMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <FaTicketAlt className="text-yellow-400" />
                <span className="text-sm font-medium text-white/90">Book Your Tickets Now</span>
              </div>

              {/* Movie Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                    NOW SHOWING
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar />
                    <span className="text-white font-semibold">{currentMovie.rating}</span>
                    <span className="text-white/60 text-sm">/10</span>
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {currentMovie.title}
                </h1>

                <p className="text-lg text-white/80 max-w-xl">
                  {currentMovie.description}
                </p>

                <div className="flex items-center gap-4 text-white/70">
                  <span className="text-sm">{currentMovie.genre}</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="text-sm">2h 45m</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="text-sm">IMAX 3D</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#shows"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <FaTicketAlt />
                  Book Tickets
                </a>
                <button className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <FaPlay className="text-sm" />
                  Watch Trailer
                </button>
              </div>

              {/* Slide Navigation */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                  <FaChevronLeft />
                </button>
                <div className="flex items-center gap-2">
                  {heroMovies.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Right Content - Search Box */}
            <div className="lg:justify-self-end w-full max-w-md">
              <div
                className="rounded-2xl p-6 backdrop-blur-xl border"
                style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.1)" }}
              >
                <h3 className="text-xl font-bold text-white mb-6">Quick Search</h3>

                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search movies, theaters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:border-white/40 transition-all"
                    />
                  </div>

                  {/* Location */}
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <select className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-white/40 transition-all appearance-none cursor-pointer">
                      <option value="" className="text-gray-800">Select City</option>
                      <option value="mumbai" className="text-gray-800">Mumbai</option>
                      <option value="delhi" className="text-gray-800">Delhi</option>
                      <option value="bangalore" className="text-gray-800">Bangalore</option>
                      <option value="hyderabad" className="text-gray-800">Hyderabad</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-white/40 transition-all"
                    />
                  </div>

                  <button
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Search Shows
                  </button>
                </div>

                {/* Popular Tags */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-white/60 mb-3">Popular:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Action", "Comedy", "Drama", "Horror"].map((tag) => (
                      <button
                        key={tag}
                        className="px-3 py-1.5 rounded-lg text-sm text-white/80 bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;