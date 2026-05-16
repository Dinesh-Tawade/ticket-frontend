"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";
import {
  FaStar, FaClock, FaTicketAlt, FaFire, FaArrowRight,
  FaMapMarkerAlt, FaChevronLeft, FaChevronRight,
  FaTag, FaLanguage, FaFilm,
} from "react-icons/fa";

// Genres for filtering
const GENRES = [
  "ALL", "ACTION", "COMEDY", "DRAMA", "ROMANCE", "THRILLER", "HORROR", "SCI-FI"
];

// Status Filters
const STATUS_FILTERS = [
  { key: "ALL", label: "All Shows" },
  { key: "BOOKING_OPEN", label: "Now Showing" },
  { key: "COMING_SOON", label: "Coming Soon" },
];

// Items per page
const ITEMS_PER_PAGE = 10;

/* ─────────────────────── ShowCard Component ─────────────────────── */
function ShowCard({ show, onClick }) {
  const isOpen = show.status === "BOOKING_OPEN";
  const isTrending = show.movie?.isTrending;
  const rating = show.movie?.rating;
  const genre = show.movie?.genre;

  return (
    <div
      className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      onClick={() => onClick(show._id)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
        <img
          src={show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80"}
          alt={show.movie?.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500 text-black font-semibold text-sm">
            <FaTicketAlt size={12} />
            <span>Book Now</span>
          </div>
        </div>

        {/* Trending Badge */}
        {isTrending && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500 text-white text-xs font-bold">
            <FaFire size={10} /> TRENDING
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold">
            <FaStar size={10} /> {Number(rating).toFixed(1)}
          </div>
        )}

        {/* City */}
        {show.theaterId?.city && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 text-white text-xs">
            <FaMapMarkerAlt size={8} /> {show.theaterId.city}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--foreground)" }}>
          {show.movie?.name || "Untitled"}
        </h3>
        
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          {show.startTime && (
            <span className="flex items-center gap-1"><FaClock size={10} /> {show.startTime}</span>
          )}
          {show.movie?.duration && <span>{show.movie.duration}m</span>}
          {show.movie?.language && <span>{show.movie.language}</span>}
        </div>

        {genre && (
          <p className="text-xs text-yellow-500">{genre}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
          <span className={`text-sm font-bold ${show.isPaid ? "text-yellow-500" : "text-green-500"}`}>
            {show.isPaid ? `₹${show.basePrice}` : "FREE"}
          </span>
          <span className={`text-xs ${isOpen ? "text-green-500" : "text-gray-400"}`}>
            {isOpen ? "Now Showing" : "Coming Soon"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Pagination Component ─────────────────────── */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition"
        style={{ color: "var(--foreground)" }}
      >
        <FaChevronLeft size={14} />
      </button>
      
      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          className={`min-w-[32px] h-8 rounded-lg text-sm transition ${
            currentPage === page
              ? "bg-yellow-500 text-black font-semibold"
              : page === "..."
              ? "cursor-default"
              : "hover:bg-gray-800"
          }`}
          style={currentPage !== page && page !== "..." ? { color: "var(--foreground)" } : {}}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition"
        style={{ color: "var(--foreground)" }}
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
}

/* ─────────────────────── Skeleton Loader ─────────────────────── */
function SkeletonLoader() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: "var(--card)" }}>
          <div className="aspect-[2/3] bg-gray-700" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
            <div className="h-6 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
export default function ShowsPage() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef(null);

  const { data: showsData, isLoading, error } = useQuery({
    queryKey: ["publicShows"],
    queryFn: getPublicShows,
  });

  const allShows = showsData?.data || [];

  // Apply filters
  let filteredShows = [...allShows];
  
  if (statusFilter !== "ALL") {
    filteredShows = filteredShows.filter(show => show.status === statusFilter);
  }
  if (selectedGenre !== "ALL") {
    filteredShows = filteredShows.filter(show => show.movie?.genre === selectedGenre);
  }

  // Pagination
  const totalPages = Math.ceil(filteredShows.length / ITEMS_PER_PAGE);
  const paginatedShows = filteredShows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, statusFilter]);

  const handleMovieClick = (showId) => router.push(`/public/shows/${showId}`);

  // Hero shows (trending)
  const trendingShows = allShows.filter(s => s.movie?.isTrending).slice(0, 6);

  return (
    <section ref={sectionRef} className="py-8 px-4 md:px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--foreground)" }}>
            Movie Shows
          </h1>
          <p className="text-gray-400 mt-1">Book tickets for the latest movies</p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Genre Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaTag className="text-yellow-500 text-sm" />
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Genre</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    selectedGenre === genre
                      ? "bg-yellow-500 text-black font-medium"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {genre === "ALL" ? "All Genres" : genre}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaFilm className="text-yellow-500 text-sm" />
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    statusFilter === filter.key
                      ? "bg-yellow-500 text-black font-medium"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Section - Below Filters */}
        {!isLoading && trendingShows.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <FaFire className="text-red-500" />
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Trending Now</h2>
              <span className="text-xs text-gray-400">Most popular this week</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {trendingShows.map((show) => (
                <div
                  key={show._id}
                  className="cursor-pointer group"
                  onClick={() => handleMovieClick(show._id)}
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80"}
                      alt={show.movie?.name}
                      className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FaTicketAlt className="text-yellow-500 text-xl" />
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-1 line-clamp-1" style={{ color: "var(--foreground)" }}>
                    {show.movie?.name}
                  </p>
                  <p className="text-xs text-gray-500">{show.theaterId?.city}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Shows Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              All Shows
              <span className="text-sm font-normal text-gray-400 ml-2">({filteredShows.length})</span>
            </h2>
          </div>

          {/* Shows Grid */}
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load shows. Please try again.</p>
            </div>
          ) : paginatedShows.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No shows found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginatedShows.map((show) => (
                  <ShowCard key={show._id} show={show} onClick={handleMovieClick} />
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}