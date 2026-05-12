"use client";

import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/app/hooks/useTheme";
import useLanguage from "@/app/hooks/useLanguage";
import { logout } from "../services/adminCommunication"; // Import logout from your API service
import "@/app/i18n";

function formatRole(role) {
  if (!role) return "";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

const navLinks = [];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const langDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const isDark = theme === "dark";

  const languageLabels = {
    en: "EN",
    hi: "HI",
    mr: "MR",
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  // TanStack Query mutation for logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Call the logout API function from admincommunication
      await logout();
      // The logout function handles localStorage cleanup internally
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      
      // Redirect to login page
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still redirect to login even if API fails
      // The logout function already cleared localStorage
      queryClient.clear();
      router.push("/login");
    },
  });

  // Logout handler
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Zoom functions - actual page zoom
  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    setZoomLevel(newZoom);
    document.body.style.zoom = `${newZoom}%`;
    document.body.style.transform = `scale(${newZoom / 100})`;
    document.body.style.transformOrigin = "top left";
    document.body.style.width = `${100 / (newZoom / 100)}%`;
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 50);
    setZoomLevel(newZoom);
    document.body.style.zoom = `${newZoom}%`;
    document.body.style.transform = `scale(${newZoom / 100})`;
    document.body.style.transformOrigin = "top left";
    document.body.style.width = `${100 / (newZoom / 100)}%`;
  };

  // Load saved zoom level on mount
  useEffect(() => {
    const savedZoom = localStorage.getItem("pageZoom");
    if (savedZoom) {
      const zoom = parseInt(savedZoom);
      setZoomLevel(zoom);
      document.body.style.zoom = `${zoom}%`;
      document.body.style.transform = `scale(${zoom / 100})`;
      document.body.style.transformOrigin = "top left";
      document.body.style.width = `${100 / (zoom / 100)}%`;
    }
  }, []);

  // Save zoom level when changed
  useEffect(() => {
    localStorage.setItem("pageZoom", zoomLevel);
  }, [zoomLevel]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showLangDropdown || showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLangDropdown, showUserDropdown]);

  return (
      <nav
      className="flex-shrink-0 w-full border-b transition-colors duration-200 bg-white dark:bg-gray-900"
      style={{
        background: "var(--background)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-7 h-[60px] flex items-center justify-between">

        {/* Brand */}
        <a href="/" className="flex items-center gap-3 no-underline">
          <div className="relative w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
            <svg className="relative z-10" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </div>
          <div>
            <p
              className="text-[15px] font-bold tracking-tight leading-none transition-colors duration-200"
              style={{ color: "var(--foreground)" }}
            >
              AdminOS
            </p>
            <p
              className="text-[11px] tracking-wide leading-none mt-0.5 transition-colors duration-200"
              style={{ color: "var(--blue)", opacity: 0.7 }}
            >
              System console
            </p>
          </div>
        </a>

        {/* Nav Links */}
        <div className="flex items-center gap-0.5">
          {navLinks.map(({ label, active, badge }) => (
            <a
              key={label}
              href="#"
              className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-lg text-[13px] font-medium transition-all duration-100 border"
              style={{
                color: active ? "var(--purple)" : "var(--foreground)",
                background: active ? "var(--card)" : "transparent",
                borderColor: active ? "var(--purple)" : "transparent",
                opacity: active ? 1 : 0.6,
              }}
            >
              {active && (
                <span className="w-[5px] h-[5px] rounded-full bg-[#6c5ce7] flex-shrink-0" />
              )}
              {label}
              {badge && (
                <span className="text-[10px] font-semibold bg-[#6c5ce7] text-white rounded px-1 py-px leading-snug">
                  {badge}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">

          {/* Language Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="h-[34px] px-3 rounded-lg border text-[13px] font-medium transition-all min-w-[50px]"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            >
              {languageLabels[language] || "EN"}
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-20 rounded-lg border overflow-hidden z-50"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="py-1">
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      className="w-full px-3 py-1.5 text-[12px] text-left transition-colors"
                      style={{
                        color: "var(--foreground)",
                        background: language === code ? "var(--card-border)" : "transparent",
                        fontWeight: language === code ? "bold" : "normal",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border transition-all hover:rotate-[15deg]"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
          >
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            )}
          </button>

          {/* Zoom Controls - Actual Page Zoom */}
          <div className="hidden sm:flex items-center gap-1 px-2 h-[34px] rounded-lg border"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
            }}
          >
            <button 
              onClick={zoomOut} 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors p-1"
              title="Zoom Out (50% to 200%)"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5" />
                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
                <line x1="4" y1="7" x2="10" y2="7" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-xs w-10 text-center font-medium" style={{ color: "var(--foreground)" }}>
              {zoomLevel}%
            </span>
            <button 
              onClick={zoomIn} 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors p-1"
              title="Zoom In (50% to 200%)"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5" />
                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
                <line x1="4" y1="7" x2="10" y2="7" strokeLinecap="round" />
                <line x1="7" y1="4" x2="7" y2="10" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Reset Zoom Button */}
          <button
            onClick={() => {
              setZoomLevel(100);
              document.body.style.zoom = "100%";
              document.body.style.transform = "scale(1)";
              document.body.style.transformOrigin = "top left";
              document.body.style.width = "100%";
            }}
            className="hidden sm:block text-[10px] px-2 h-[34px] rounded-lg border hover:bg-white/10 transition-all cursor-pointer"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
            title="Reset Zoom to 100%"
          >
            Reset
          </button>
           <button
            onClick={() => { handleLogout();
            }}
            className="hidden sm:block text-[10px] px-2 h-[34px] rounded-lg border bg-red-200 transition-all cursor-pointer"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
            title="Reset Zoom to 100%"
          >
            Logout
          </button>

          {/* User Profile with Dropdown */}
          {user && (
            <div className="relative" ref={userDropdownRef}>
              <div
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 h-[34px] pl-1.5 pr-2.5 rounded-[10px] border cursor-pointer transition-all hover:bg-white/5"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--card-border)",
                }}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-[26px] h-[26px] rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p
                    className="text-[12.5px] font-medium leading-none transition-colors duration-200"
                    style={{ color: "var(--foreground)" }}
                  >
                    {user.name || "User"}
                  </p>
                  <p
                    className="text-[10px] leading-none mt-0.5 flex items-center gap-1 transition-colors duration-200"
                    style={{ color: "var(--foreground)", opacity: 0.6 }}
                  >
                    <span className="w-[5px] h-[5px] rounded-full bg-[#22d37e] flex-shrink-0" />
                    {formatRole(user.role)}
                  </p>
                </div>
                <svg
                  className="ml-0.5 transition-transform duration-200"
                  style={{ 
                    transform: showUserDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: "var(--foreground)", 
                    opacity: 0.4 
                  }}
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border overflow-hidden z-50 shadow-lg"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <div className="py-1">
                    <div className="px-3 py-2 border-b"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <p className="text-[12px] font-medium" style={{ color: "var(--foreground)" }}>
                        {user.email || user.name}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        Role: {formatRole(user.role)}
                      </p>
                    </div>
                    
                    <a
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                      style={{ color: "var(--foreground)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="5" r="3" />
                        <path d="M2 14v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                      </svg>
                      Profile Settings
                    </a>
                    
                    <a
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                      style={{ color: "var(--foreground)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="8" r="2.5" />
                        <path d="M8 1v2M8 13v2M2 8H1M4 8H2M14 8h-2M12 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M12.5 3.5L11 5M5 11l-1.5 1.5" />
                      </svg>
                      Settings
                    </a>
                    
                    <hr className="my-1" style={{ borderColor: "var(--card-border)" }} />
                    
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round" />
                          </svg>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" />
                            <path d="M10 11l3-3-3-3" />
                            <path d="M13 8H6" />
                          </svg>
                          Logout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}