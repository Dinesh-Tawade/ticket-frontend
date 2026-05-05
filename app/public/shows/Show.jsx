


"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";
import {
  FaStar, FaClock, FaTicketAlt, FaFire,
  FaArrowRight, FaMapMarkerAlt, FaChevronRight,
} from "react-icons/fa";

const FILTERS = [
  { key: "ALL", label: "All Shows" },
  { key: "NOW_SHOWING", label: "Now Showing" },
  { key: "COMING_SOON", label: "Coming Soon" },
];

function ShowCard({ show, onClick, index, visible }) {
  const isOpen = show.status === "BOOKING_OPEN";
  const isTrending = show.movie?.isTrending;
  const rating = show.movie?.rating;

  return (
    <div
      className={`show-card group ${visible ? "visible" : ""}`}
      onClick={() => onClick(show._id)}
      style={{ animationDelay: `${index * 60}ms` }}
      tabIndex={0}
      role="button"
      aria-label={`Book tickets for ${show.movie?.name}`}
      onKeyDown={(e) => e.key === "Enter" && onClick(show._id)}
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
            <span>Book Now</span>
            <FaArrowRight size={11} />
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

        {/* City at bottom of poster */}
        {show.theaterId?.city && (
          <div className="show-card__city">
            <FaMapMarkerAlt size={9} />
            <span>{show.theaterId.city}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="show-card__body">
        <h3 className="show-card__title">{show.movie?.name || "Untitled"}</h3>

        {show.movie?.genre && (
          <p className="show-card__genre">{show.movie.genre}</p>
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
          <span className={`show-card__status ${isOpen ? "show-card__status--open" : "show-card__status--closed"}`}>
            <span className="show-card__status-dot" />
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Show() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const { data: showsData, isLoading, error } = useQuery({
    queryKey: ["publicShows"],
    queryFn: getPublicShows,
  });

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const allShows = showsData?.data || [];
  const filtered = filter === "ALL"
    ? allShows
    : allShows.filter((s) => s.status === filter || s.movie?.status === filter);

  const handleMovieClick = (showId) => router.push(`/public/shows/${showId}`);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Section ── */
        .shows-section {
          font-family: 'DM Sans', sans-serif;
          background: var(--background);
          padding: 80px 0 100px;
          position: relative;
          overflow: hidden;
        }
        .shows-section::before {
          content: '';
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Section header ── */
        .shows-header {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 48px;
          padding: 0 16px;
        }
        @media (min-width: 768px) {
          .shows-header {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .shows-header__eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .shows-header__line {
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, #d4af37, #f4d03f);
          border-radius: 2px;
        }
        .shows-header__eyebrow-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #d4af37;
        }
        .shows-header__title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.1;
          margin: 0;
        }
        .shows-header__subtitle {
          font-size: 14px;
          color: var(--foreground);
          opacity: 0.5;
          margin-top: 6px;
        }

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
          padding: 0 16px;
        }
        @media (min-width: 640px) { .shows-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
        @media (min-width: 1024px) { .shows-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
        @media (min-width: 1280px) { .shows-grid { grid-template-columns: repeat(5, 1fr); gap: 22px; } }

        /* ── Card ── */
        .show-card {
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          background: var(--card, white);
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.35s ease,
                      border-color 0.25s ease;
          outline: none;
          opacity: 0;
          transform: translateY(20px);
        }
        .show-card.visible {
          animation: cardReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .show-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(212,175,55,0.25);
          border-color: rgba(212,175,55,0.3);
        }
        .show-card:focus-visible {
          box-shadow: 0 0 0 3px rgba(212,175,55,0.5);
        }

        /* ── Poster ── */
        .show-card__poster {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
          background: #111;
        }
        .show-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: block;
        }
        .show-card:hover .show-card__img { transform: scale(1.07); }

        .show-card__grad-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 100%);
        }
        .show-card__grad-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 60px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.35), transparent);
        }

        /* Hover overlay */
        .show-card__overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.45);
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(2px);
        }
        .show-card:hover .show-card__overlay { opacity: 1; }

        .show-card__book-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 50px;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #000;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.03em;
          box-shadow: 0 8px 24px rgba(212,175,55,0.5);
          transform: translateY(8px);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .show-card:hover .show-card__book-btn { transform: translateY(0); }

        /* Badges */
        .show-card__badges-top {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 7px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .badge--hot {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .show-card__rating {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          color: #f4d03f;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid rgba(244,208,63,0.25);
        }

        .show-card__city {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.7);
          font-size: 10px;
        }

        /* Card body */
        .show-card__body {
          padding: 12px 13px 13px;
        }
        .show-card__title {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          line-height: 1.3;
          margin: 0 0 3px;
          color: var(--foreground);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .show-card__genre {
          font-size: 11px;
          color: #d4af37;
          margin: 0 0 8px;
          font-weight: 500;
          opacity: 0.85;
        }
        .show-card__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .show-card__meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--foreground);
          opacity: 0.5;
        }
        .show-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 9px;
          border-top: 1px solid var(--card-border, rgba(0,0,0,0.07));
        }
        .show-card__price {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .show-card__price--paid { color: #d4af37; }
        .show-card__price--free { color: #22c55e; }

        .show-card__status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }
        .show-card__status--open {
          background: rgba(34,197,94,0.12);
          color: #16a34a;
        }
        .dark .show-card__status--open { color: #4ade80; }
        .show-card__status--closed {
          background: rgba(239,68,68,0.1);
          color: #dc2626;
        }
        .show-card__status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
        .show-card__status--open .show-card__status-dot {
          animation: pulse-dot 2s ease infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        /* ── Empty state ── */
        .shows-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 24px;
        }
        .shows-empty__icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.3;
        }
        .shows-empty__text {
          font-size: 15px;
          color: var(--foreground);
          opacity: 0.45;
        }

        /* ── Skeleton ── */
        .skeleton-card {
          border-radius: 16px;
          overflow: hidden;
          background: var(--card, white);
          border: 1px solid var(--card-border, rgba(0,0,0,0.06));
        }
        .skeleton-poster {
          aspect-ratio: 2/3;
          background: var(--card-border, rgba(0,0,0,0.06));
          animation: skeleton-pulse 1.6s ease infinite;
        }
        .skeleton-body { padding: 12px 13px; }
        .skeleton-line {
          height: 10px;
          border-radius: 6px;
          background: var(--card-border, rgba(0,0,0,0.06));
          animation: skeleton-pulse 1.6s ease infinite;
          margin-bottom: 8px;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── Count badge ── */
        .shows-count {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(212,175,55,0.1);
          color: #d4af37;
          border: 1px solid rgba(212,175,55,0.2);
          margin-left: 10px;
          vertical-align: middle;
        }
      `}</style>

      <section id="shows" className="shows-section" ref={sectionRef}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="shows-header">
            <div>
              <div className="shows-header__eyebrow">
                <div className="shows-header__line" />
                <span className="shows-header__eyebrow-text">Now Showing</span>
              </div>
              <h2 className="shows-header__title">
                Latest Screenings
                {!isLoading && allShows.length > 0 && (
                  <span className="shows-count">{filtered.length}</span>
                )}
              </h2>
              <p className="shows-header__subtitle">
                Book your seats for the finest cinema experiences
              </p>
            </div>

            {/* Filters */}
            <div className="shows-filters" role="group" aria-label="Filter shows">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`filter-pill ${filter === f.key ? "active" : ""}`}
                  aria-pressed={filter === f.key}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="shows-grid">

            {/* Loading skeletons */}
            {isLoading && Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="skeleton-poster" />
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width: "80%" }} />
                  <div className="skeleton-line" style={{ width: "55%", animationDelay: "0.15s" }} />
                  <div className="skeleton-line" style={{ width: "65%", height: "8px", animationDelay: "0.3s" }} />
                </div>
              </div>
            ))}

            {/* Error */}
            {error && (
              <div className="shows-empty">
                <div className="shows-empty__icon">⚠️</div>
                <p className="shows-empty__text">Couldn't load shows. Please try again.</p>
              </div>
            )}

            {/* Cards */}
            {!isLoading && !error && filtered.length > 0 && filtered.map((show, i) => (
              <ShowCard
                key={show._id}
                show={show}
                index={i}
                onClick={handleMovieClick}
                visible={visible}
              />
            ))}

            {/* Empty */}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="shows-empty">
                <div className="shows-empty__icon">🎬</div>
                <p className="shows-empty__text">No shows found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// Trigger card animation when section is visible
function ShowCardWrapper({ show, index, onClick, visible }) {
  return (
    <ShowCard
      show={show}
      index={index}
      onClick={onClick}
      visible={visible}
    />
  );
}

export default Show;