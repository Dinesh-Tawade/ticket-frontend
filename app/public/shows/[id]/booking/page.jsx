"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicShowById } from "@/app/services/publicCommunication";
import SeatSelection from "../../components/SeatSelection";

function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const showId = params.id;

  const { data: showData, isLoading, error } = useQuery({
    queryKey: ["show", showId],
    queryFn: () => getPublicShowById(showId),
    enabled: !!showId,
  });

  const handleBack = () => {
    router.push(`/public/shows/${showId}`);
  };

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

  if (error || !showData?.data) {
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
    <SeatSelection 
      showId={showId} 
      showDetails={showData.data} 
      onBack={handleBack} 
    />
  );
}

export default BookingPage;
