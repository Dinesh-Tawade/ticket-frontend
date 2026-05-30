"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/TheaterOwnerSidebar";
import Navbar from "../components/Navbar";
import { getMe } from "../services/adminCommunication";

export default function TheaterOwnerLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      router.push("/login");
    } else if (user.role !== "THEATER_OWNER") {
      router.push("/");
    } else {
      getMe()
        .then((res) => {
          const profile = res.data || res;
          if (profile?.accessibleSeats) {
            localStorage.setItem(
              "user",
              JSON.stringify({ ...user, accessibleSeats: profile.accessibleSeats })
            );
          }
        })
        .catch(() => {});
      setAuthenticated(true);
      setChecking(false);
    }
  }, [router]);

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col h-screen" style={{ marginLeft: "240px" }}>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}