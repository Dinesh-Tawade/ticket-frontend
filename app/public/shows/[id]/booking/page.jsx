"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicShowById, getTheaterProducts } from "@/app/services/publicCommunication";
import SeatSelection from "../../components/SeatSelection";
import FoodOrder from "../../../../components/FoodOrder";
import AuthModal from "@/app/components/public/AuthModal";
import { FaUtensils, FaTicketAlt, FaArrowLeft, FaShoppingCart } from "react-icons/fa";

function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const showId = params.id;
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [step, setStep] = useState("seats"); // 'seats' or 'food'
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [skipFood, setSkipFood] = useState(false);

  const { data: showData, isLoading, error } = useQuery({
    queryKey: ["show", showId],
    queryFn: () => getPublicShowById(showId),
    enabled: !!showId,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["theater-products", showData?.data?.theaterId?._id],
    queryFn: () => getTheaterProducts(showData?.data?.theaterId?._id),
    enabled: !!showData?.data?.theaterId?._id && !skipFood,
  });

  const handleBack = () => {
    if (step === "food") {
      setStep("seats");
    } else {
      router.push(`/public/shows/${showId}`);
    }
  };

  const handleNeedLogin = () => {
    setAuthModalOpen(true);
  };

  const handleSeatsSelected = (seats, bookingInfo) => {
    setSelectedSeats(seats);
    setBookingData(bookingInfo);
    setStep("food");
  };

  const handleSkipFood = () => {
    setSkipFood(true);
    // Proceed to payment/confirmation
    router.push(`/public/shows/${showId}/payment?bookingId=${bookingData?.bookingId}`);
  };

  const handleCompleteOrder = (orderData) => {
    // Navigate to payment or confirmation
    router.push(`/public/shows/${showId}/payment?bookingId=${bookingData?.bookingId}&orderId=${orderData.orderId}`);
  };

  const show = showData?.data;
  const products = productsData?.data?.products || {};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{ borderColor: "var(--card-border)", borderTopColor: "var(--foreground)" }} />
          <p className="mt-4" style={{ color: "var(--foreground)", opacity: 0.7 }}>Loading show details...</p>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center rounded-2xl p-8 border" style={{ background: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
          <p style={{ color: "#ef4444" }}>Error loading show details. Please try again.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Progress Steps */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b" style={{ borderColor: "var(--card-border)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <FaArrowLeft size={16} />
              <span className="text-sm">Back</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === "seats" ? "text-yellow-500" : "text-white/40"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === "seats" ? "bg-yellow-500 text-black" : "bg-white/10 text-white/40"
                }`}>
                  1
                </div>
                <span className="text-sm hidden sm:inline">Select Seats</span>
                <FaTicketAlt size={14} className="sm:hidden" />
              </div>
              <div className="w-12 h-px bg-white/20" />
              <div className={`flex items-center gap-2 ${step === "food" ? "text-yellow-500" : "text-white/40"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === "food" ? "bg-yellow-500 text-black" : "bg-white/10 text-white/40"
                }`}>
                  2
                </div>
                <span className="text-sm hidden sm:inline">Add Snacks</span>
                <FaUtensils size={14} className="sm:hidden" />
              </div>
            </div>
            
            <div className="w-8" />
          </div>
        </div>
      </div>

      {/* Step 1: Seat Selection */}
      {step === "seats" && (
        <SeatSelection 
          showId={showId} 
          showDetails={show}
          onSeatsSelected={handleSeatsSelected}
          onBack={handleBack}
          onNeedLogin={handleNeedLogin}
        />
      )}

      {/* Step 2: Food Order */}
      {step === "food" && !skipFood && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Order Summary Card */}
            <div className="mb-6 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <FaTicketAlt className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Booking Summary</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {selectedSeats.length} Seats • ₹{bookingData?.totalAmount}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkipFood}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                  style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                >
                  Skip & Continue
                </button>
              </div>
            </div>

            {/* Food Order Component */}
            <FoodOrder
              theaterId={show?.theaterId?._id}
              products={products}
              isLoading={productsLoading}
              bookingId={bookingData?.bookingId}
              onComplete={handleCompleteOrder}
              onSkip={handleSkipFood}
            />
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode="login" 
      />
    </div>
  );
}

export default BookingPage;