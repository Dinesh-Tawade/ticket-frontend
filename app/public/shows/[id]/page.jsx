


"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicShowById, getPublicBookingSettings } from "@/app/services/publicCommunication";
import {
  FaStar, FaClock, FaCalendarAlt, FaMapMarkerAlt,
  FaTicketAlt, FaArrowLeft, FaFire, FaGlobe,
  FaFilm, FaChair,
} from "react-icons/fa";
import Header from "@/app/components/public/Header";
import Footer from "@/app/components/public/Footer";
import Show from '@/app/public/shows/Show';

function ShowDetails() {
  const router = useRouter();
  const params = useParams();
  const showId = params.id;

  const { data: showData, isLoading, error } = useQuery({
    queryKey: ["show", showId],
    queryFn: () => getPublicShowById(showId),
    enabled: !!showId,
  });

  const { data: bookingSettingsData } = useQuery({
    queryKey: ["public-booking-settings"],
    queryFn: getPublicBookingSettings,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const show = showData?.data;
  const bookingSettings = bookingSettingsData?.data;
  const isBookingFeatureEnabled = bookingSettings?.isBookingEnabled === true;
  const bookingDisabledReason = bookingSettings?.disabledReason || "Booking is currently disabled.";
  const isOpen = show?.status === "BOOKING_OPEN" && isBookingFeatureEnabled;

  const handleBookNow = () => router.push(`/public/shows/${showId}/booking`);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="sd-page">
          <Header />
          <div className="sd-loading">
            <div className="sd-spinner" />
            <p className="sd-loading-text">Loading show details…</p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  /* ── Error ── */
  if (error || !show) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="sd-page">
          <Header />
          <div className="sd-loading">
            <div className="sd-error-card">
              <span className="sd-error-icon">⚠️</span>
              <p className="sd-error-msg">Couldn't load this show.</p>
              <button className="sd-btn-gold" onClick={() => router.push("/")}>
                Go Home
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const occupancyPct = show.totalSeats
    ? Math.round(((show.totalSeats - show.availableSeats) / show.totalSeats) * 100)
    : 0;

  return (
    <>
      <style>{STYLES}</style>

      <div className="sd-page">
        <Header />

        {/* ── Backdrop ── */}
        <div className="sd-backdrop">
          <img
            src={show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"}
            alt=""
            className="sd-backdrop__img"
            aria-hidden="true"
          />
          <div className="sd-backdrop__grad" />
        </div>

        {/* ── Back button ── */}
        <div className="sd-nav">
          <div className="sd-nav__inner">
            <button className="sd-back-btn" onClick={() => router.back()}>
              <FaArrowLeft size={13} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className="sd-hero">
          <div className="sd-hero__inner">

            {/* Poster */}
            <div className="sd-poster-wrap">
              <div className="sd-poster">
                <img
                  src={show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80"}
                  alt={show.movie?.name}
                  className="sd-poster__img"
                />
                {show.movie?.rating && (
                  <div className="sd-poster__rating">
                    <FaStar size={11} />
                    <span>{Number(show.movie.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hero info */}
            <div className="sd-hero__info">
              {/* Badges */}
              <div className="sd-badges">
                {show.movie?.isTrending && (
                  <span className="sd-badge sd-badge--fire">
                    <FaFire size={10} /> Trending
                  </span>
                )}
                {show.movie?.genre && (
                  <span className="sd-badge sd-badge--genre">{show.movie.genre}</span>
                )}
                <span className={`sd-badge ${isOpen ? "sd-badge--open" : "sd-badge--closed"}`}>
                  <span className="sd-badge__dot" />
                  {isOpen ? "Booking Open" : "Booking Closed"}
                </span>
              </div>

              <h1 className="sd-title">{show.movie?.name}</h1>

              {/* Quick meta */}
              <div className="sd-meta-row">
                {show.movie?.duration && (
                  <span className="sd-meta-chip">
                    <FaClock size={11} /> {show.movie.duration} min
                  </span>
                )}
                {show.movie?.language && (
                  <span className="sd-meta-chip">
                    <FaGlobe size={11} /> {show.movie.language}
                  </span>
                )}
                {show.movie?.rating && (
                  <span className="sd-meta-chip sd-meta-chip--gold">
                    <FaStar size={11} /> {show.movie.rating} / 10
                  </span>
                )}
              </div>

              {show.movie?.description && (
                <p className="sd-description">{show.movie.description}</p>
              )}

              {/* CTA row */}
              <div className="sd-cta-row">
             
                {/* <div className="sd-price-pill">
                  {show.isPaid ? (
                    <>
                      <span className="sd-price-pill__label">per ticket</span>
                      <span className="sd-price-pill__value">₹{show.basePrice}</span>
                    </>
                  ) : (
                    <span className="sd-price-pill__free">FREE ENTRY</span>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="sd-body">
          <div className="sd-body__inner">

            {/* Left col */}
            <div className="sd-body__left">

              {/* Show Details card */}
              <div className="sd-card">
                <div className="sd-card__header">
                  <div className="sd-card__header-line" />
                  <h2 className="sd-card__title">Show Details</h2>
                </div>

                <div className="sd-detail-grid">
                  {[
                    {
                      icon: <FaMapMarkerAlt />,
                      color: "#3b82f6",
                      label: "Theater",
                      primary: show.theaterId?.name,
                      secondary: [show.theaterId?.location, show.theaterId?.city].filter(Boolean).join(", "),
                    },
                    {
                      icon: <FaCalendarAlt />,
                      color: "#a855f7",
                      label: "Date & Time",
                      primary: show.showDate
                        ? new Date(show.showDate).toLocaleDateString("en-IN", {
                            weekday: "long", month: "long", day: "numeric",
                          })
                        : "—",
                      secondary: [show.startTime, show.endTime].filter(Boolean).join(" – "),
                    },
                    {
                      icon: <FaChair />,
                      color: "#22c55e",
                      label: "Screen",
                      primary: `Screen ${show.screenNumber || 1}`,
                      secondary: `${show.availableSeats} seats available`,
                    },
                    {
                      icon: <FaClock />,
                      color: "#f59e0b",
                      label: "Duration",
                      primary: `${show.movie?.duration || "120"} minutes`,
                      secondary: `Language: ${show.movie?.language || "Hindi"}`,
                    },
                  ].map(({ icon, color, label, primary, secondary }) => (
                    <div key={label} className="sd-detail-item">
                      <div className="sd-detail-icon" style={{ "--ic": color }}>
                        {icon}
                      </div>
                      <div>
                        <p className="sd-detail-label">{label}</p>
                        <p className="sd-detail-primary">{primary}</p>
                        {secondary && <p className="sd-detail-secondary">{secondary}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About card */}
              <div className="sd-card">
                <div className="sd-card__header">
                  <div className="sd-card__header-line" />
                  <h2 className="sd-card__title">About the Movie</h2>
                </div>

                <p className="sd-about-text">
                  {show.movie?.description || "No description available."}
                </p>

                <div className="sd-movie-meta-grid">
                  {[
                    { label: "Genre", value: show.movie?.genre },
                    { label: "Language", value: show.movie?.language },
                    { label: "Rating", value: show.movie?.rating ? `${show.movie.rating} / 10` : null },
                    {
                      label: "Release",
                      value: show.movie?.releaseDate
                        ? new Date(show.movie.releaseDate).toLocaleDateString("en-IN")
                        : null,
                    },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="sd-movie-meta-item">
                        <span className="sd-movie-meta-label">{label}</span>
                        <span className="sd-movie-meta-value">{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>

            {/* Right col — sticky booking card */}
            <div className="sd-body__right">
              <div className="sd-booking-card">
                <div className="sd-booking-card__header">
                  <FaTicketAlt size={14} />
                  <span>Book Tickets</span>
                </div>

                {/* Occupancy bar */}
                <div className="sd-occupancy">
                  <div className="sd-occupancy__labels">
                    <span>Availability</span>
                    <span>{show.availableSeats} / {show.totalSeats}</span>
                  </div>
                  <div className="sd-occupancy__track">
                    <div
                      className="sd-occupancy__fill"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <p className="sd-occupancy__note">
                    {occupancyPct >= 80
                      ? "🔥 Filling fast!"
                      : occupancyPct >= 50
                      ? "Selling steadily"
                      : "Good availability"}
                  </p>
                </div>

                {/* Details list */}
                <div className="sd-booking-rows">
                  {[
                    {
                      label: "Status",
                      value: (
                        <span className={`sd-status-chip ${isOpen ? "sd-status-chip--open" : "sd-status-chip--closed"}`}>
                          <span className="sd-badge__dot" />
                          {isOpen ? "Booking Open" : "Closed"}
                        </span>
                      ),
                    },
                    { label: "Available Seats", value: show.availableSeats },
                    { label: "Total Seats", value: show.totalSeats },
                    {
                      label: "Price / ticket",
                      value: (
                        <span className={show.isPaid ? "sd-price--paid" : "sd-price--free"}>
                          {show.isPaid ? `₹${show.basePrice}` : "FREE"}
                        </span>
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="sd-booking-row">
                      <span className="sd-booking-row__label">{label}</span>
                      <span className="sd-booking-row__value">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`sd-book-cta ${isOpen ? "sd-book-cta--active" : "sd-book-cta--disabled"}`}
                  onClick={handleBookNow}
                  disabled={!isOpen}
                  title={!isBookingFeatureEnabled ? bookingDisabledReason : ""}
                >
                  <FaTicketAlt size={15} />
                  {isBookingFeatureEnabled ? (isOpen ? "Book Now" : "Booking Closed") : "Booking Disabled"}
                </button>

                {isOpen && (
                  <p className="sd-urgency">
                    <span className="sd-urgency__dot" />
                    Seats are filling up — grab yours!
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
        <Show/>
        <Footer />
      </div>
    </>
  );
}

/* ───────────────────────────── styles ───────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sd-page {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: var(--background);
    position: relative;
  }

  /* Loading */
  .sd-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .sd-spinner {
    width: 48px; height: 48px;
    border: 3px solid rgba(212,175,55,0.2);
    border-top-color: #d4af37;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sd-loading-text { font-size: 14px; color: var(--foreground); opacity: 0.5; }

  .sd-error-card {
    text-align: center;
    padding: 40px 32px;
    border-radius: 20px;
    border: 1px solid rgba(239,68,68,0.25);
    background: var(--card);
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .sd-error-icon { font-size: 40px; }
  .sd-error-msg { font-size: 15px; color: var(--foreground); opacity: 0.6; }

  /* Backdrop */
  .sd-backdrop {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 560px;
    overflow: hidden;
    z-index: 0;
  }
  .sd-backdrop__img {
    width: 100%; height: 100%;
    object-fit: cover;
    filter: blur(2px) saturate(0.7);
    transform: scale(1.04);
  }
  .sd-backdrop__grad {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.55) 0%,
      rgba(0,0,0,0.7) 40%,
      var(--background, #fff) 100%
    );
  }

  /* Nav */
  .sd-nav {
    position: relative; z-index: 10;
    padding: 24px 16px 0;
  }
  .sd-nav__inner { max-width: 1280px; margin: 0 auto; }

  .sd-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 16px;
    border-radius: 12px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(8px);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .sd-back-btn:hover {
    background: rgba(255,255,255,0.18);
    color: white;
    transform: translateX(-2px);
  }

  /* Hero */
  .sd-hero {
    position: relative; z-index: 5;
    padding: 32px 16px 0;
  }
  .sd-hero__inner {
    max-width: 1280px; margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
    align-items: flex-start;
  }
  @media (min-width: 768px) {
    .sd-hero__inner { flex-direction: row; align-items: flex-end; gap: 40px; }
  }

  /* Poster */
  .sd-poster-wrap { flex-shrink: 0; }
  .sd-poster {
    position: relative;
    width: 200px;
    border-radius: 18px;
    overflow: hidden;
    border: 3px solid rgba(255,255,255,0.15);
    box-shadow: 0 32px 64px rgba(0,0,0,0.5);
  }
  @media (min-width: 768px) { .sd-poster { width: 240px; } }
  .sd-poster__img {
    width: 100%; aspect-ratio: 2/3;
    object-fit: cover; display: block;
  }
  .sd-poster__rating {
    position: absolute; top: 10px; right: 10px;
    display: flex; align-items: center; gap: 4px;
    padding: 4px 9px; border-radius: 8px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    color: #f4d03f; font-size: 12px; font-weight: 700;
    border: 1px solid rgba(244,208,63,0.3);
  }

  /* Hero info */
  .sd-hero__info { flex: 1; padding-bottom: 8px; }

  .sd-badges {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 16px;
  }
  .sd-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.04em;
  }
  .sd-badge--fire { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
  .sd-badge--genre {
    background: rgba(212,175,55,0.15);
    border: 1px solid rgba(212,175,55,0.3);
    color: #f4d03f;
  }
  .sd-badge--open {
    background: rgba(34,197,94,0.15);
    border: 1px solid rgba(34,197,94,0.3);
    color: #4ade80;
  }
  .sd-badge--closed {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.25);
    color: #f87171;
  }
  .sd-badge__dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
  }
  .sd-badge--open .sd-badge__dot {
    animation: blink 1.8s ease infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }

  .sd-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 900;
    line-height: 1.05;
    color: white;
    margin: 0 0 16px;
  }

  .sd-meta-row {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 20px;
  }
  .sd-meta-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 500;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.75);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(6px);
  }
  .sd-meta-chip--gold {
    background: rgba(212,175,55,0.15);
    border-color: rgba(212,175,55,0.3);
    color: #f4d03f;
  }

  .sd-description {
    font-size: 15px; line-height: 1.75;
    color: rgba(255,255,255,0.7);
    max-width: 600px;
    margin: 0 0 28px;
  }

  /* CTA row */
  .sd-cta-row {
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
  }
  .sd-btn-gold {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px;
    border-radius: 12px;
    font-size: 14px; font-weight: 700;
    color: #000;
    background: linear-gradient(135deg, #d4af37, #b8860b);
    border: none; cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(212,175,55,0.35);
  }
  .sd-btn-gold:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(212,175,55,0.5);
  }
  .sd-btn-gold:disabled { opacity: 0.45; cursor: not-allowed; }
  .sd-btn-gold--lg { padding: 14px 28px; font-size: 15px; }

  .sd-price-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 18px; border-radius: 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
  }
  .sd-price-pill__label { font-size: 11px; color: rgba(255,255,255,0.5); }
  .sd-price-pill__value { font-size: 18px; font-weight: 700; color: #f4d03f; }
  .sd-price-pill__free { font-size: 14px; font-weight: 700; color: #4ade80; }

  /* Body */
  .sd-body {
    position: relative; z-index: 5;
    padding: 48px 16px 80px;
  }
  .sd-body__inner {
    max-width: 1280px; margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 1024px) {
    .sd-body__inner { grid-template-columns: 1fr 340px; }
  }
  .sd-body__left { display: flex; flex-direction: column; gap: 24px; }

  /* Card */
  .sd-card {
    border-radius: 20px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    background: var(--card, white);
    padding: 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  .sd-card__header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .sd-card__header-line {
    width: 4px; height: 22px;
    border-radius: 4px;
    background: linear-gradient(180deg, #d4af37, #b8860b);
    flex-shrink: 0;
  }
  .sd-card__title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700;
    color: var(--foreground);
    margin: 0;
  }

  /* Detail grid */
  .sd-detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 640px) {
    .sd-detail-grid { grid-template-columns: 1fr 1fr; }
  }
  .sd-detail-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px;
    border-radius: 14px;
    background: var(--background, rgba(0,0,0,0.02));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    transition: border-color 0.2s ease;
  }
  .sd-detail-item:hover { border-color: rgba(212,175,55,0.25); }

  .sd-detail-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--ic) 12%, transparent);
    color: var(--ic);
  }
  .sd-detail-label {
    font-size: 11px; font-weight: 500;
    color: var(--foreground); opacity: 0.5;
    margin: 0 0 3px; text-transform: uppercase; letter-spacing: 0.07em;
  }
  .sd-detail-primary {
    font-size: 15px; font-weight: 600;
    color: var(--foreground); margin: 0 0 2px;
  }
  .sd-detail-secondary {
    font-size: 13px; color: var(--foreground); opacity: 0.55; margin: 0;
  }

  /* About */
  .sd-about-text {
    font-size: 15px; line-height: 1.8;
    color: var(--foreground); opacity: 0.75;
    margin: 0 0 24px;
  }
  .sd-movie-meta-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.07));
  }
  .sd-movie-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .sd-movie-meta-label {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--foreground); opacity: 0.4;
  }
  .sd-movie-meta-value {
    font-size: 14px; font-weight: 500; color: var(--foreground);
  }

  /* Booking card */
  .sd-booking-card {
    border-radius: 20px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    background: var(--card, white);
    padding: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    position: sticky; top: 90px;
  }
  .sd-booking-card__header {
    display: flex; align-items: center; gap: 8px;
    font-size: 16px; font-weight: 700;
    color: var(--foreground);
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.07));
  }
  .sd-booking-card__header svg { color: #d4af37; }

  /* Occupancy */
  .sd-occupancy { margin-bottom: 20px; }
  .sd-occupancy__labels {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--foreground); opacity: 0.55;
    margin-bottom: 8px;
  }
  .sd-occupancy__track {
    height: 6px; border-radius: 6px;
    background: var(--card-border, rgba(0,0,0,0.08));
    overflow: hidden;
  }
  .sd-occupancy__fill {
    height: 100%; border-radius: 6px;
    background: linear-gradient(90deg, #22c55e, #d4af37, #ef4444);
    transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .sd-occupancy__note {
    margin-top: 6px; font-size: 12px;
    color: var(--foreground); opacity: 0.5;
  }

  /* Booking rows */
  .sd-booking-rows { margin-bottom: 20px; }
  .sd-booking-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    font-size: 14px;
  }
  .sd-booking-row:last-child { border-bottom: none; }
  .sd-booking-row__label { color: var(--foreground); opacity: 0.55; }
  .sd-booking-row__value { font-weight: 600; color: var(--foreground); }

  .sd-status-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px;
  }
  .sd-status-chip--open { background: rgba(34,197,94,0.12); color: #16a34a; }
  .dark .sd-status-chip--open { color: #4ade80; }
  .sd-status-chip--closed { background: rgba(239,68,68,0.1); color: #dc2626; }
  .sd-status-chip .sd-badge__dot { width: 5px; height: 5px; }
  .sd-status-chip--open .sd-badge__dot { animation: blink 1.8s ease infinite; }

  .sd-price--paid { color: #d4af37; font-size: 16px; }
  .sd-price--free { color: #22c55e; font-size: 15px; }

  /* Book CTA */
  .sd-book-cta {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    padding: 15px;
    border-radius: 14px;
    font-size: 15px; font-weight: 700;
    border: none; cursor: pointer;
    transition: all 0.3s ease;
  }
  .sd-book-cta--active {
    background: linear-gradient(135deg, #d4af37, #b8860b);
    color: #000;
    box-shadow: 0 6px 24px rgba(212,175,55,0.4);
  }
  .sd-book-cta--active:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(212,175,55,0.55);
  }
  .sd-book-cta--disabled {
    background: var(--card-border, rgba(0,0,0,0.08));
    color: var(--foreground);
    opacity: 0.4;
    cursor: not-allowed;
  }

  .sd-urgency {
    display: flex; align-items: center; gap: 7px;
    justify-content: center;
    margin-top: 12px; font-size: 12px;
    color: #22c55e; font-weight: 500;
  }
  .sd-urgency__dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22c55e;
    animation: blink 1.5s ease infinite;
  }
`;

export default ShowDetails;