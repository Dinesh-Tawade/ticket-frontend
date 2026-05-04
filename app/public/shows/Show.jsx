"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";
import SeatSelection from "./components/SeatSelection";
import { FaStar, FaClock, FaMapMarkerAlt, FaTicketAlt, FaCalendarAlt, FaFire } from "react-icons/fa";

function Show() {
  const router = useRouter();
  const [selectedShow, setSelectedShow] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const { data: shows, isLoading, error } = useQuery({
    queryKey: ["publicShows"],
    queryFn: getPublicShows,
  });

  const handleBookNow = (show) => setSelectedShow(show);
  const handleBackToShows = () => setSelectedShow(null);

  if (selectedShow) {
    return <SeatSelection showId={selectedShow._id} showDetails={selectedShow} onBack={handleBackToShows} />;
  }

  if (isLoading) {
    return (
      <section id="shows" className="py-20 px-4" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4" style={{ borderColor: "var(--card-border)", borderTopColor: "var(--foreground)" }} />
          <p className="mt-4 text-lg" style={{ color: "var(--foreground)", opacity: 0.7 }}>Loading shows...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="shows" className="py-20 px-4" style={{ background: "var(--background)" }}>
        <div className="max-w-xl mx-auto text-center rounded-2xl p-8 border" style={{ background: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
          <p style={{ color: "#ef4444" }}>Error loading shows. Please try again.</p>
        </div>
      </section>
    );
  }

  const filters = ["ALL", "NOW_SHOWING", "COMING_SOON"];

  return (
    <section id="shows" className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Now Showing
            </h2>
            <p style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Book your tickets for the latest blockbusters
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "text-white" : ""}`}
                style={filter === f ? { background: "var(--gradient-primary)" } : { color: "var(--foreground)", opacity: 0.7 }}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {shows?.data?.map((show) => (
            <div
              key={show._id}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
            >
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={show.movie?.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80"}
                  alt={show.movie?.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {show.movie?.isTrending && (
                    <span className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                      <FaFire /> TRENDING
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                    {show.movie?.genre}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                  <FaStar /> {show.movie?.rating || "8.5"}
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{show.movie?.name}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-sm">
                    <span className="flex items-center gap-1"><FaClock /> {show.movie?.duration || "2h 30m"}</span>
                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {show.theaterId?.city}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Theater Info */}
                <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>{show.theaterId?.name}</p>
                  <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>{show.theaterId?.location}</p>
                </div>

                {/* Show Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    <FaCalendarAlt style={{ color: "var(--blue)" }} />
                    <span>{new Date(show.showDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    <FaClock style={{ color: "var(--green)" }} />
                    <span>{show.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    <FaTicketAlt style={{ color: "var(--purple)" }} />
                    <span>{show.availableSeats} seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: show.isPaid ? "var(--yellow)" : "var(--green)" }}>
                    {show.isPaid ? `₹${show.basePrice}` : "FREE"}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleBookNow(show)}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <FaTicketAlt /> Book Now
                </button>

                {/* Status Indicator */}
                {show.status === "BOOKING_OPEN" && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium" style={{ color: "var(--green)" }}>Booking Open</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Show;