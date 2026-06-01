"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/admin/login");
    } else {
      setChecking(false);
    }
  }, [router]);

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