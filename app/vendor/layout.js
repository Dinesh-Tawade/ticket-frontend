"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import VendorSidebar from "../components/vendor/Sidebar";
import Navbar from "../components/Navbar";
import { isAuthenticated, isVendor, getCurrentUser } from "../services/adminCommunication";

export default function VendorLayout({ children }) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Protect vendor routes
    if (!isAuthenticated() || !isVendor()) {
      router.push("/login");
    }
  }, [router]);

  const user = getCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <VendorSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      {/* Right Side Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar user={user} />
        
        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{
            transition: "margin-left 0.3s ease"
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    
    </div>
  );
}