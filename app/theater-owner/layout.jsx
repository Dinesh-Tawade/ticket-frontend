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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      // You can implement a custom event system or context for sidebar state
      // For now, we'll just check window width
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen for sidebar collapse event
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    // Get initial sidebar state from localStorage or default
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }

    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      router.push("/login");
      setChecking(false);
    } else if (user.role !== "THEATER_OWNER") {
      router.push("/");
      setChecking(false);
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

  // Calculate margin based on sidebar state
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return sidebarCollapsed ? 72 : 240;
  };

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
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div 
        className="flex flex-col h-full transition-all duration-300"
        style={{ marginLeft: `${getSidebarWidth()}px` }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}