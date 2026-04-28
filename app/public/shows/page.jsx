"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";
import SeatSelection from "./components/SeatSelection";  // ✅ Import SeatSelection

function Show() {
  const router = useRouter();
  const [selectedShow, setSelectedShow] = useState(null);  // ✅ Store full show object

  const { data: shows, isLoading, error } = useQuery({
    queryKey: ["publicShows"],
    queryFn: getPublicShows,
  });

  // ✅ Fixed: Pass show object, not just ID
  const handleBookNow = (show) => {
    setSelectedShow(show);
  };

  const handleBackToShows = () => {
    setSelectedShow(null);
  };

  // ✅ Show seat selection if a show is selected
  if (selectedShow) {
    return <SeatSelection showId={selectedShow._id} showDetails={selectedShow} onBack={handleBackToShows} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-red-600">Error loading shows. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-red-600">🎬 MovieShows</h1>
              <p className="text-gray-500 text-sm">Book your favorite movie tickets</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">📍 Mumbai</span>
              <button 
                onClick={() => router.push('/public/my-bookings')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700"
              >
                My Bookings
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {shows?.data?.map((show) => (
            <div key={show._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 lg:w-72 relative">
                  <img
                    src={show.movie?.poster || "https://via.placeholder.com/300x450?text=No+Poster"}
                    alt={show.movie?.name}
                    className="w-full h-80 md:h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x450?text=No+Poster";
                    }}
                  />
                  {show.movie?.isTrending && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                      🔥 Trending
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{show.movie?.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {show.movie?.genre}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {show.movie?.language}
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold">
                        ⭐ {show.movie?.rating}/10
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold">
                        🕐 {show.movie?.duration} mins
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{show.movie?.description}</p>
                  </div>

                  <div className="border-t border-b border-gray-100 py-4 my-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🏢</span>
                      <div>
                        <p className="font-semibold text-gray-800">{show.theaterId?.name}</p>
                        <p className="text-sm text-gray-500">{show.theaterId?.location}, {show.theaterId?.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-800 text-sm">
                          {new Date(show.showDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-semibold text-gray-800 text-sm">
                          {show.startTime} - {show.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">💺</span>
                      <div>
                        <p className="text-xs text-gray-500">Available Seats</p>
                        <p className="font-semibold text-green-600 text-sm">
                          {show.availableSeats} / {show.totalSeats}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎫</span>
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="font-bold text-red-600">₹{show.basePrice}</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Free/Paid Show Indicator */}
                  <div className="mb-4">
                    {show.isPaid ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                        <p className="text-sm text-yellow-800">💳 Paid Show - Payment required for booking</p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                        <p className="text-sm text-green-800">🎉 Free Show - No payment required!</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleBookNow(show)}  // ✅ Pass entire show object
                      className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md"
                    >
                      Book Now
                    </button>
                    <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200">
                      Details
                    </button>
                  </div>

                  {show.status === "BOOKING_OPEN" && (
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-green-600 font-medium">Booking Open</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Show;