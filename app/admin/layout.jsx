"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      setChecking(false);
    } else {
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const role = userData.role?.trim().toUpperCase();

          if (role === "SCANNING_USER" && pathname !== "/admin/scan-ticket") {
            router.push("/admin/scan-ticket");
          } else if (role !== "SUPER_ADMIN" && role !== "SCANNING_USER") {
            if (role === "THEATER_OWNER") {
              router.push("/theater-owner/dashboard");
            } else if (role === "VENDOR") {
              router.push("/vendor/dashboard");
            } else {
              router.push("/");
            }
          } else {
            setChecking(false);
          }
        } catch (e) {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    }
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      {/* Sidebar */}
      <div className="z-40" style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden will-change-auto" style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <Navbar />
        <main className="flex-1 overflow-y-auto w-full will-change-auto" style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}