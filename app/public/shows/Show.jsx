

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";
import {
  FaStar, FaClock, FaTicketAlt, FaFire,
  FaArrowRight, FaMapMarkerAlt, FaChevronLeft, FaChevronRight,
  FaTh, FaStream,
} from "react-icons/fa";

const FILTERS = [
  { key: "ALL",         label: "All Shows"   },
  { key: "NOW_SHOWING", label: "Now Showing" },
  { key: "COMING_SOON", label: "Coming Soon" },
];

/* ─────────────────────── ShowCard ─────────────────────── */
function ShowCard({ show, onClick, index, visible, compact = false }) {
  const isOpen     = show.status === "BOOKING_OPEN";
  const isTrending = show.movie?.isTrending;
  const rating     = show.movie?.rating;

  return (
    <div
      className={`show-card${compact ? " show-card--compact" : ""} group ${visible ? "visible" : ""}`}
      onClick={() => onClick(show._id)}
      style={{ animationDelay: `${index * 55}ms` }}
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
        <div className="show-card__grad-bottom" />
        <div className="show-card__grad-top" />

        {/* Hover CTA */}
        <div className="show-card__overlay">
          <div className="show-card__book-btn">
            <FaTicketAlt size={12} />
            <span>Book Now</span>
            <FaArrowRight size={10} />
          </div>
        </div>

        {/* Badges */}
        <div className="show-card__badges-top">
          {isTrending && (
            <span className="badge badge--hot"><FaFire size={8} /> TRENDING</span>
          )}
        </div>
        {rating && (
          <div className="show-card__rating">
            <FaStar size={9} />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        )}
        {show.theaterId?.city && (
          <div className="show-card__city">
            <FaMapMarkerAlt size={9} />
            <span>{show.theaterId.city}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="show-card__body">
        <h3 className="show-card__title">{show.movie?.name || "Untitled"}</h3>
        {show.movie?.genre && <p className="show-card__genre">{show.movie.genre}</p>}
        <div className="show-card__meta">
          {show.startTime && (
            <span className="show-card__meta-item"><FaClock size={9} />{show.startTime}</span>
          )}
          {show.movie?.duration && (
            <span className="show-card__meta-item">{show.movie.duration}m</span>
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

/* ─────────────────────── Slider ─────────────────────── */
function Slider({ shows, onClick }) {
  const trackRef   = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const isDragging = useRef(false);
  const dragStart  = useRef({ x: 0, scrollLeft: 0 });

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", sync); ro.disconnect(); };
  }, [sync, shows]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(200 * 3, el.clientWidth * 0.65);
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current  = { x: e.pageX, scrollLeft: trackRef.current.scrollLeft };
    trackRef.current.style.cursor     = "grabbing";
    trackRef.current.style.userSelect = "none";
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.pageX - dragStart.current.x;
    trackRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };
  const endDrag = () => {
    isDragging.current = false;
    if (trackRef.current) {
      trackRef.current.style.cursor     = "grab";
      trackRef.current.style.userSelect = "";
    }
  };

  return (
    <div className="slider-root">
      {/* Left arrow */}
      <button
        className={`slider-arrow slider-arrow--left ${canLeft ? "slider-arrow--visible" : ""}`}
        onClick={() => scroll("prev")}
        aria-label="Scroll left"
      >
        <FaChevronLeft size={15} />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="slider-track"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {shows.map((show, i) => (
          <div key={show._id} className="slider-item">
            <ShowCard show={show} onClick={onClick} index={i} visible compact />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        className={`slider-arrow slider-arrow--right ${canRight ? "slider-arrow--visible" : ""}`}
        onClick={() => scroll("next")}
        aria-label="Scroll right"
      >
        <FaChevronRight size={15} />
      </button>

      {/* Edge fades */}
      {canLeft  && <div className="slider-fade slider-fade--left"  />}
      {canRight && <div className="slider-fade slider-fade--right" />}
    </div>
  );
}

/* ─────────────────────── Show (main) ─────────────────────── */
function Show() {
  const router     = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const [filter,   setFilter]   = useState(filterParam || "ALL");
  const [viewMode, setViewMode] = useState("slider");
  const sectionRef = useRef(null);
  const [visible,  setVisible]  = useState(false);

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
  const filtered = filter === "ALL" || filter === "NOW_SHOWING"
    ? allShows
    : allShows.filter((s) => s.status === filter || s.movie?.status === filter);

  const handleMovieClick = (showId) => router.push(`/public/shows/${showId}`);

  /* ── skeleton helper ── */
  const SkeletonCard = ({ slider = false }) => (
    <div className={`skeleton-card${slider ? " skeleton-card--slider" : ""}`}>
      <div className="skeleton-poster" />
      <div className="skeleton-body">
        <div className="skeleton-line" style={{ width: "78%" }} />
        <div className="skeleton-line" style={{ width: "52%", animationDelay: "0.15s" }} />
        <div className="skeleton-line" style={{ width: "63%", height: "8px", animationDelay: "0.28s" }} />
      </div>
    </div>
  );

  const EmptyState = ({ icon, text }) => (
    <div className="shows-empty">
      <div className="shows-empty__icon">{icon}</div>
      <p className="shows-empty__text">{text}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Section ── */
        .shows-section {
          font-family: 'DM Sans', sans-serif;
          background: var(--background);
          padding: 80px 0 100px;
          position: relative; overflow: hidden;
        }
        .shows-section::before {
          content: ''; position: absolute; top: -120px; left: 50%;
          transform: translateX(-50%); width: 900px; height: 300px;
          background: radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Header ── */
        .shows-header {
          display: flex; flex-direction: column; gap: 20px;
          margin-bottom: 36px; padding: 0 16px;
        }
        @media (min-width: 768px) {
          .shows-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
        }
        .shows-header__eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .shows-header__line {
          width: 32px; height: 2px;
          background: linear-gradient(90deg, #d4af37, #f4d03f); border-radius: 2px;
        }
        .shows-header__eyebrow-text {
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: #d4af37;
        }
        .shows-header__title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 40px); font-weight: 700;
          color: var(--foreground); line-height: 1.1; margin: 0;
        }
        .shows-header__subtitle { font-size: 14px; color: var(--foreground); opacity: 0.5; margin-top: 6px; }

        /* ── Controls ── */
        .shows-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex-shrink: 0; }
        .shows-filters {
          display: flex; gap: 6px; padding: 4px; border-radius: 14px;
          background: var(--card, rgba(0,0,0,0.04));
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
        }
        .filter-pill {
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
          border: none; cursor: pointer; white-space: nowrap; outline: none;
          color: var(--foreground); opacity: 0.55; background: transparent;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .filter-pill:hover  { opacity: 0.85; }
        .filter-pill.active {
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #000; opacity: 1; font-weight: 600;
          box-shadow: 0 4px 14px rgba(212,175,55,0.35); transform: scale(1.03);
        }

        .view-toggle {
          display: flex; gap: 4px; padding: 4px; border-radius: 12px;
          background: var(--card, rgba(0,0,0,0.04));
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
        }
        .view-toggle-btn {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s ease;
          background: transparent; color: var(--foreground); opacity: 0.4;
        }
        .view-toggle-btn:hover { opacity: 0.72; }
        .view-toggle-btn.active {
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #000; opacity: 1; box-shadow: 0 2px 10px rgba(212,175,55,0.35);
        }

        .shows-count {
          display: inline-flex; align-items: center; padding: 3px 10px;
          border-radius: 20px; font-size: 12px; font-weight: 600;
          background: rgba(212,175,55,0.1); color: #d4af37;
          border: 1px solid rgba(212,175,55,0.2); margin-left: 10px; vertical-align: middle;
        }

        /* ── SLIDER ── */
        .slider-root { position: relative; padding: 0 16px; }

        .slider-track {
          display: flex; gap: 16px;
          overflow-x: auto; scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
          cursor: grab; padding: 8px 4px 24px;
        }
        .slider-track::-webkit-scrollbar { display: none; }

        .slider-item {
          flex: 0 0 180px; scroll-snap-align: start;
        }
        @media (min-width: 480px)  { .slider-item { flex-basis: 190px; } }
        @media (min-width: 768px)  { .slider-item { flex-basis: 200px; } }
        @media (min-width: 1024px) { .slider-item { flex-basis: 210px; } }
        @media (min-width: 1280px) { .slider-item { flex-basis: 220px; } }

        .slider-arrow {
          position: absolute; top: 42%; transform: translateY(-50%);
          z-index: 20; width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--card-border, rgba(0,0,0,0.1));
          background: var(--card, white); color: var(--foreground);
          cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.14);
          opacity: 0; pointer-events: none;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .slider-arrow--visible { opacity: 1; pointer-events: auto; }
        .slider-arrow--left  { left: -6px; }
        .slider-arrow--right { right: -6px; }
        .slider-arrow:hover {
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #000; border-color: transparent;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 24px rgba(212,175,55,0.45);
        }

        .slider-fade {
          position: absolute; top: 0; bottom: 0; width: 72px;
          pointer-events: none; z-index: 10;
        }
        .slider-fade--left  {
          left: 16px;
          background: linear-gradient(to right, var(--background, #fff), transparent);
        }
        .slider-fade--right {
          right: 16px;
          background: linear-gradient(to left, var(--background, #fff), transparent);
        }

        /* ── GRID ── */
        .shows-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px; padding: 0 16px;
        }
        @media (min-width: 640px)  { .shows-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
        @media (min-width: 1024px) { .shows-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
        @media (min-width: 1280px) { .shows-grid { grid-template-columns: repeat(5, 1fr); gap: 22px; } }

        /* ── CARD ── */
        .show-card {
          border-radius: 16px; overflow: hidden; cursor: pointer;
          background: var(--card, white);
          border: 1px solid var(--card-border, rgba(0,0,0,0.08));
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.35s ease, border-color 0.25s ease;
          outline: none; opacity: 0; transform: translateY(16px);
        }
        .show-card.visible { animation: cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .show-card:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 20px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(212,175,55,0.25);
          border-color: rgba(212,175,55,0.3);
        }
        .show-card:focus-visible { box-shadow: 0 0 0 3px rgba(212,175,55,0.5); }

        /* Slider cards always visible */
        .show-card--compact { opacity: 1 !important; transform: none !important; animation: none !important; }
        .show-card--compact:hover { transform: translateY(-6px) scale(1.015) !important; }

        /* Poster */
        .show-card__poster { position: relative; aspect-ratio: 2/3; overflow: hidden; background: #111; }
        .show-card__img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .show-card:hover .show-card__img { transform: scale(1.07); }
        .show-card__grad-bottom {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 45%, transparent 100%);
        }
        .show-card__grad-top {
          position: absolute; top: 0; left: 0; right: 0; height: 55px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.32), transparent);
        }

        /* Hover overlay */
        .show-card__overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.42); opacity: 0;
          transition: opacity 0.3s ease; backdrop-filter: blur(2px);
        }
        .show-card:hover .show-card__overlay { opacity: 1; }
        .show-card__book-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 15px; border-radius: 50px;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #000; font-size: 11px; font-weight: 700; letter-spacing: 0.03em;
          box-shadow: 0 6px 20px rgba(212,175,55,0.5);
          transform: translateY(8px);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .show-card:hover .show-card__book-btn { transform: translateY(0); }

        .show-card__badges-top {
          position: absolute; top: 9px; left: 9px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 6px; border-radius: 6px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .badge--hot { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }

        .show-card__rating {
          position: absolute; top: 9px; right: 9px;
          display: flex; align-items: center; gap: 4px;
          padding: 3px 7px; border-radius: 7px;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
          color: #f4d03f; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(244,208,63,0.22);
        }
        .show-card__city {
          position: absolute; bottom: 9px; left: 9px;
          display: flex; align-items: center; gap: 4px;
          color: rgba(255,255,255,0.65); font-size: 9px;
        }

        .show-card__body { padding: 11px 12px 12px; }
        .show-card__title {
          font-weight: 600; font-size: 12px; line-height: 1.3; margin: 0 0 3px;
          color: var(--foreground);
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
        }
        .show-card__genre { font-size: 10px; color: #d4af37; margin: 0 0 7px; font-weight: 500; opacity: 0.9; }
        .show-card__meta  { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
        .show-card__meta-item {
          display: flex; align-items: center; gap: 3px;
          font-size: 10px; color: var(--foreground); opacity: 0.5;
        }
        .show-card__footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 8px; border-top: 1px solid var(--card-border, rgba(0,0,0,0.07));
        }
        .show-card__price { font-size: 13px; font-weight: 700; letter-spacing: -0.01em; }
        .show-card__price--paid { color: #d4af37; }
        .show-card__price--free { color: #22c55e; }
        .show-card__status {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 600; padding: 3px 8px;
          border-radius: 20px; letter-spacing: 0.02em;
        }
        .show-card__status--open   { background: rgba(34,197,94,0.12); color: #16a34a; }
        .dark .show-card__status--open { color: #4ade80; }
        .show-card__status--closed { background: rgba(239,68,68,0.1);  color: #dc2626; }
        .show-card__status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .show-card__status--open .show-card__status-dot { animation: pulse-dot 2s ease infinite; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }

        /* Skeleton */
        .skeleton-card {
          border-radius: 16px; overflow: hidden;
          background: var(--card, white);
          border: 1px solid var(--card-border, rgba(0,0,0,0.06));
        }
        .skeleton-card--slider { flex: 0 0 190px; }
        .skeleton-poster {
          aspect-ratio: 2/3;
          background: var(--card-border, rgba(0,0,0,0.06));
          animation: skeleton-pulse 1.6s ease infinite;
        }
        .skeleton-body { padding: 11px 12px; }
        .skeleton-line {
          height: 9px; border-radius: 5px;
          background: var(--card-border, rgba(0,0,0,0.06));
          animation: skeleton-pulse 1.6s ease infinite; margin-bottom: 7px;
        }
        @keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.38; } }

        /* Empty */
        .shows-empty { grid-column: 1 / -1; text-align: center; padding: 60px 24px; }
        .shows-empty__icon { font-size: 42px; margin-bottom: 14px; opacity: 0.3; }
        .shows-empty__text { font-size: 14px; color: var(--foreground); opacity: 0.45; }

        /* Slider empty (not in a grid) */
        .slider-empty { text-align: center; padding: 60px 24px; }
        .slider-empty .shows-empty__icon { font-size: 42px; margin-bottom: 14px; opacity: 0.3; }
        .slider-empty .shows-empty__text { font-size: 14px; color: var(--foreground); opacity: 0.45; }
      `}</style>

      <section id="shows" className="shows-section" ref={sectionRef}>
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
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

            {/* Controls: filters + view toggle */}
            <div className="shows-controls">
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

              <div className="view-toggle" role="group" aria-label="View mode">
                <button
                  className={`view-toggle-btn ${viewMode === "slider" ? "active" : ""}`}
                  onClick={() => setViewMode("slider")}
                  aria-label="Slider view"
                  title="Slider"
                >
                  <FaStream size={13} />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  title="Grid"
                >
                  <FaTh size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── SLIDER VIEW ── */}
          {viewMode === "slider" && (
            isLoading ? (
              /* skeleton slider */
              <div className="slider-root">
                <div className="slider-track" style={{ cursor: "default" }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton-card skeleton-card--slider" style={{ animationDelay: `${i * 55}ms` }}>
                      <div className="skeleton-poster" />
                      <div className="skeleton-body">
                        <div className="skeleton-line" style={{ width: "78%" }} />
                        <div className="skeleton-line" style={{ width: "52%", animationDelay: "0.15s" }} />
                        <div className="skeleton-line" style={{ width: "63%", height: "8px", animationDelay: "0.28s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="slider-empty">
                <div className="shows-empty__icon">⚠️</div>
                <p className="shows-empty__text">Couldn't load shows. Please try again.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="slider-empty">
                <div className="shows-empty__icon">🎬</div>
                <p className="shows-empty__text">No shows found for this filter.</p>
              </div>
            ) : (
              <Slider shows={filtered} onClick={handleMovieClick} />
            )
          )}

          {/* ── GRID VIEW ── */}
          {viewMode === "grid" && (
            <div className="shows-grid">
              {isLoading && Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-poster" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" style={{ width: "78%" }} />
                    <div className="skeleton-line" style={{ width: "52%", animationDelay: "0.15s" }} />
                    <div className="skeleton-line" style={{ width: "63%", height: "8px", animationDelay: "0.28s" }} />
                  </div>
                </div>
              ))}
              {error && (
                <div className="shows-empty">
                  <div className="shows-empty__icon">⚠️</div>
                  <p className="shows-empty__text">Couldn't load shows. Please try again.</p>
                </div>
              )}
              {!isLoading && !error && filtered.map((show, i) => (
                <ShowCard
                  key={show._id}
                  show={show}
                  index={i}
                  onClick={handleMovieClick}
                  visible={visible}
                />
              ))}
              {!isLoading && !error && filtered.length === 0 && (
                <div className="shows-empty">
                  <div className="shows-empty__icon">🎬</div>
                  <p className="shows-empty__text">No shows found for this filter.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default Show;