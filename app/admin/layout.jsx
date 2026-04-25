"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
const router = useRouter();
const [checking, setChecking] = useState(true);

useEffect(() => {
const token = localStorage.getItem("token");

if (!token) {
  router.push("/admin/login");
} else {
  setChecking(false);
}

}, [router]);

// Prevent UI flash before auth check


return ( <div className="flex"> <Sidebar />

  <div className="flex-1 bg-gray-100 min-h-screen">
    <Navbar />
    <div className="p-6">{children}</div>
  </div>
</div>

);
}
