"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicBookingSettings, getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";
import {
  FaStar, FaClock, FaTicketAlt, FaFire,
  FaArrowRight, FaMapMarkerAlt, FaChevronRight,
} from "react-icons/fa";
import Header from "@/app/components/public/Header";
import Footer from "@/app/components/public/Footer";

const FILTERS = [
  { key: "ALL", label: "All Shows" },
  { key: "NOW_SHOWING", label: "Now Showing" },
  { key: "COMING_SOON", label: "Coming Soon" },
];

function ShowCard({ show, onClick, index, visible, isBookingFeatureEnabled, bookingDisabledReason }) {
  const isOpen = show.status === "BOOKING_OPEN" && isBookingFeatureEnabled;
  const isTrending = show.movie?.isTrending;
  const rating = show.movie?.rating;
  const handleClick = () => {
    onClick(show._id);
  };

  return (
    <div
      className={`show-card group ${visible ? "visible" : ""}`}
      onClick={handleClick}
      style={{ animationDelay: `${index * 60}ms` }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${show.movie?.name}`}
      title={!isBookingFeatureEnabled ? `${bookingDisabledReason} View show details.` : ""}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Poster */}
      <div className="show-card__poster">
        <img
          src={show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80"}
          alt={show.movie?.name}
          className="show-card__img"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";
          }}
        />

        {/* Gradient layers */}
        <div className="show-card__grad-bottom" />
        <div className="show-card__grad-top" />

        {/* Hover overlay */}
        <div className="show-card__overlay">
          <div className="show-card__book-btn">
            <FaTicketAlt size={13} />
            <span>{isBookingFeatureEnabled ? "Book Now" : "Booking Disabled"}</span>
            {isBookingFeatureEnabled && <FaArrowRight size={11} />}
          </div>
        </div>

        {/* Top badges */}
        <div className="show-card__badges-top">
          {isTrending && (
            <span className="badge badge--hot">
              <FaFire size={9} /> TRENDING
            </span>
          )}
        </div>

        {/* Rating badge */}
        {rating && (
          <div className="show-card__rating">
            <FaStar size={9} />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        )}

        {/* City & Theater at bottom of poster */}
        {show.theaterId && (
          <div className="show-card__city">
            <FaMapMarkerAlt size={9} />
            <span>{show.theaterId.name || show.theaterId.city}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="show-card__body">
        <h3 className="show-card__title">{show.movie?.name || "Untitled"}</h3>

        {show.movie?.genre && (
          <p className="show-card__genre">{show.movie.genre}</p>
        )}

        {/* Assigned Vendor info */}
        {(show.theaterId?.ownerId || show.theaterId?.assignedVendor) && (
          <div className="text-[10px] font-medium text-amber-400 opacity-90 my-1 truncate">
            🏪 {show.theaterId.assignedVendor?.storeName || show.theaterId.ownerId?.name}
          </div>
        )}

        <div className="show-card__meta">
          {show.startTime && (
            <span className="show-card__meta-item">
              <FaClock size={10} />
              {show.startTime}
            </span>
          )}
          {show.movie?.duration && (
            <span className="show-card__meta-item">
              {show.movie.duration}m
            </span>
          )}
        </div>

        <div className="show-card__footer">
          <span className={`show-card__price ${show.isPaid ? "show-card__price--paid" : "show-card__price--free"}`}>
            {show.isPaid ? `₹${show.basePrice}` : "FREE"}
          </span>
          {(() => {
            const getStatusLabel = () => {
              if (show.status === "BOOKING_OPEN") return { text: "Now Showing", className: "show-card__status--open" };
              if (show.status === "BOOKING_CLOSED") return { text: "Closed", className: "show-card__status--closed" };
              if (show.status === "COMING_SOON") return { text: "Coming Soon", className: "show-card__status--coming" };
              if (show.status === "UPCOMING") return { text: "Upcoming", className: "show-card__status--coming" };
              if (show.status === "HOUSE_FULL") return { text: "House Full", className: "show-card__status--closed" };
              if (show.status === "COMPLETED") return { text: "Completed", className: "show-card__status--closed" };
              if (show.status === "CANCELLED") return { text: "Cancelled", className: "show-card__status--closed" };
              return { text: "Closed", className: "show-card__status--closed" };
            };
            const label = getStatusLabel();
            return (
              <span className={`show-card__status ${label.className}`}>
                <span className="show-card__status-dot" />
                {label.text}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function ShowsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");

  const { data: showsData, isLoading, error } = useQuery({
    queryKey: ["publicShows"],
    queryFn: getPublicShows,
  }); 

  const { data: bookingSettingsData } = useQuery({
    queryKey: ["public-booking-settings"],
    queryFn: getPublicBookingSettings,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const allShows = showsData?.data || [];
  const bookingSettings = bookingSettingsData?.data;
  const isBookingFeatureEnabled = bookingSettings?.isBookingEnabled === true;
  const bookingDisabledReason = bookingSettings?.disabledReason || "Booking is currently disabled.";
  
  const filtered = (filter === "ALL" || filter === "NOW_SHOWING")
    ? allShows
    : allShows.filter((s) => s.status === filter || s.movie?.status === filter);

  const handleMovieClick = (showId) => router.push(`/public/shows/${showId}`);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Header />
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <a href="/" className="opacity-60 hover:text-[#d4af37] transition-colors" style={{ color: "var(--foreground)" }}>Home</a>
              <span className="opacity-20" style={{ color: "var(--foreground)" }}>/</span>
              <span className="text-[#d4af37]">Browse Shows</span>
            </div>

            {/* Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}
                >
                  Browse Shows
                </h1>
                <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
                  Discover and book tickets for the latest movies
                </p>
              </div>

              {/* Filter pills */}
              <div className="shows-filters">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`filter-pill ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shows Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin mb-4" />
              <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>Loading shows...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">Failed to load shows. Please try again later.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-20">🎬</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>No shows found</h3>
              <p className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
                {filter === "ALL" ? "No shows available at the moment." : `No ${filter.toLowerCase().replace('_', ' ')} shows.`}
              </p>
            </div>
          ) : (
            <div className="shows-grid">
              {filtered.map((show, index) => (
                <ShowCard
                  key={show._id}
                  show={show}
                  onClick={handleMovieClick}
                  index={index}
                  visible={true}
                  isBookingFeatureEnabled={isBookingFeatureEnabled}
                  bookingDisabledReason={bookingDisabledReason}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Filter pills ── */
        .shows-filters {
          display: flex;
          gap: 6px;
          padding: 4px;
          border-radius: 14px;
          background: var(--card, rgba(0,0,0,0.04));
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
          flex-shrink: 0;
        }
        .filter-pill {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          outline: none;
          color: var(--foreground);
          opacity: 0.55;
          background: transparent;
        }
        .filter-pill:hover { opacity: 0.85; }
        .filter-pill.active {
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #000;
          opacity: 1;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(212,175,55,0.35);
          transform: scale(1.03);
        }

        /* ── Grid ── */
        .shows-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .shows-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 1024px) {
          .shows-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        /* ── Card ── */
        .show-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: var(--card, #fff);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          opacity: 0;
          transform: translateY(20px);
        }
        .show-card.visible {
          animation: cardUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes cardUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .show-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(212,175,55,0.2);
        }
        .show-card--disabled {
          cursor: not-allowed;
          opacity: 0.72;
        }
        .show-card--disabled:hover {
          transform: none;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        /* ── Poster ── */
        .show-card__poster {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
        }
        .show-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .show-card:hover .show-card__img {
          transform: scale(1.05);
        }

        /* ── Gradients ── */
        .show-card__grad-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          pointer-events: none;
        }
        .show-card__grad-top {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%);
          pointer-events: none;
        }

        /* ── Hover overlay ── */
        .show-card__overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(2px);
        }
        .show-card:hover .show-card__overlay {
          opacity: 1;
        }
        .show-card__book-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(212,175,55,0.4);
          transition: all 0.3s ease;
        }
        .show-card--disabled .show-card__book-btn {
          color: #fff;
          background: #4b5563;
          box-shadow: none;
          cursor: not-allowed;
        }
        .show-card__book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(212,175,55,0.5);
        }

        /* ── Badges ── */
        .show-card__badges-top {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 6px;
          z-index: 2;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .badge--hot {
          background: rgba(239, 68, 68, 0.9);
          color: #fff;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        /* ── Rating ── */
        .show-card__rating {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 20px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          color: #fbbf24;
          font-size: 11px;
          font-weight: 600;
          z-index: 2;
        }

        /* ── City ── */
        .show-card__city {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 20px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          z-index: 2;
        }

        /* ── Card body ── */
        .show-card__body {
          padding: 14px;
        }
        .show-card__title {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--foreground);
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .show-card__genre {
          font-size: 12px;
          color: var(--foreground);
          opacity: 0.5;
          margin: 0 0 10px;
        }
        .show-card__meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .show-card__meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--foreground);
          opacity: 0.6;
        }

        /* ── Footer ── */
        .show-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--card-border, rgba(0,0,0,0.08));
        }
        .show-card__price {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
        }
        .show-card__price--paid {
          color: #d4af37;
        }
        .show-card__price--free {
          color: #16a34a;
        }
        .show-card__status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .show-card__status--open {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }
        .show-card__status--closed {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
        .show-card__status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
      `}</style>
    </div>
  );
}

export default ShowsPage;
