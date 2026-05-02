"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/TheaterOwnerSidebar";
import Navbar from "../components/Navbar";

export default function TheaterOwnerLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      router.push("/login");
    } else if (user.role !== "THEATER_OWNER") {
      router.push("/");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Navbar />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
