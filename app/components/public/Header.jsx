

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FaMoon, FaSun, FaSignOutAlt,
  FaBars, FaTimes, FaTicketAlt, FaChevronDown,
  FaSearchPlus, FaSearchMinus,
} from "react-icons/fa";
import "../../i18n";
import useTheme from "@/app/hooks/useTheme";
import useZoom from "@/app/hooks/useZoom";
import useAuth from "@/app/hooks/useAuth";
import useLanguage from "@/app/hooks/useLanguage";
import AuthModal from "./AuthModal";

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { zoom, zoomIn, zoomOut } = useZoom();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [localUserData, setLocalUserData] = useState(null);
  const [mounted, setMounted] = useState(false);
  const isLoggedIn = isAuthenticated || !!localUserData;
  const langRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        setLocalUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading stored user data:", error);
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showMobileMenu]);

  const handleLogout = () => {
    logout();
    setLocalUserData(null);
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  const languageOptions = [
    { code: "en", label: "English", short: "EN" },
    { code: "hi", label: "हिन्दी", short: "HI" },
    { code: "mr", label: "मराठी", short: "MR" },
  ];

  const navLinks = [
    { label: t("app.home") || "Home", href: "/" },
    // { label: "Movies", href: "/shows" },
    { label: "Browse Shows", href: "/public/shows" },
    { label: "My Bookings", href: "/public/my-bookings" },
  ];

  const isActive = (href) => pathname === href || (href !== "/" && pathname?.startsWith(href.split("#")[0]));

  const isHomePage = pathname === "/";
  const showTransparent = isHomePage && !scrolled;
  const scrolled_text = showTransparent ? "rgba(255,255,255,0.9)" : "var(--foreground)";
  const scrolled_muted = showTransparent ? "rgba(255,255,255,0.55)" : "var(--muted-foreground, #6b7280)";
  const controlText = showTransparent ? "text-white/80 hover:text-white hover:bg-white/10" : "";
  const controlTextScrolled = showTransparent ? controlText : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        .header-root { font-family: 'DM Sans', sans-serif; }

        .header-scrolled {
          background: var(--header-bg, rgba(255,255,255,0.93));
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.07);
        }
        .dark .header-scrolled {
          background: rgba(10,10,10,0.93);
          box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4);
        }

        .logo-wordmark {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #b8860b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-link {
          position: relative;
          transition: color 0.2s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          right: 50%;
          height: 1.5px;
          background: #d4af37;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 2px;
        }
        .nav-link.active::after,
        .nav-link:hover::after {
          left: 0;
          right: 0;
        }
        .nav-link.active { color: #d4af37 !important; }

        .dropdown-menu {
          animation: dropIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transform-origin: top right;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.92) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .mobile-overlay {
          animation: fadeIn 0.25s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .mobile-panel {
          animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .icon-btn {
          transition: all 0.2s ease;
          border-radius: 10px;
        }
        .icon-btn:hover { transform: scale(1.08); }

        .avatar-ring {
          box-shadow: 0 0 0 2px #d4af37, 0 0 0 4px rgba(212,175,55,0.2);
        }

        .mobile-nav-link {
          transition: all 0.2s ease;
          border-radius: 12px;
        }
        .mobile-nav-link:hover {
          background: rgba(212,175,55,0.08);
          padding-left: 20px;
        }
        .mobile-nav-link.active {
          background: rgba(212,175,55,0.12);
          color: #d4af37;
          border-left: 2px solid #d4af37;
        }

        .book-btn-header {
          background: linear-gradient(135deg, #d4af37, #b8860b);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .book-btn-header::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f4d03f, #d4af37);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .book-btn-header:hover::after { opacity: 1; }
        .book-btn-header:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,175,55,0.4); }
        .book-btn-header span { position: relative; z-index: 1; }

        .zoom-control {
          display: flex;
          align-items: center;
          gap: 2px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .zoom-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .zoom-btn:hover { background: rgba(212,175,55,0.15); color: #d4af37; }
        .zoom-btn:active { transform: scale(0.9); }
        .zoom-value {
          font-size: 11px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          min-width: 32px;
          text-align: center;
          letter-spacing: 0.01em;
        }
      `}</style>

      <header
        className={`header-root fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          pathname === "/" ? (scrolled ? "header-scrolled" : "bg-transparent") : "header-scrolled"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4 py-4">

            {/* ── Logo ── */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 group flex-shrink-0"
              aria-label="Go to homepage"
            >
              <img
                src="/logo.png"
                alt="Anant Vijay Auditorium"
                className="w-10 h-10 object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="hidden sm:block leading-tight">
                <div className="logo-wordmark text-[17px] font-bold leading-tight">
                  Anant Vijay
                </div>
                <div
                  className="text-[9px] font-semibold tracking-[0.2em] uppercase"
                  style={{ color: scrolled ? scrolled_muted : "rgba(255,255,255,0.45)" }}
                >
                  Auditorium
                </div>
              </div>
            </button>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isMyBookings = link.label === "My Bookings";
                return isMyBookings ? (
                  <button
                    key={link.label}
                    onClick={() => router.push(link.href)}
                    className={`nav-link px-4 py-2 text-sm font-medium rounded-lg ${isActive(link.href) ? "active" : ""}`}
                    style={{ color: isActive(link.href) ? "#d4af37" : scrolled_text }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`nav-link px-4 py-2 text-sm font-medium rounded-lg ${isActive(link.href) ? "active" : ""}`}
                    style={{ color: isActive(link.href) ? "#d4af37" : scrolled_text }}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className={`icon-btn flex items-center gap-1 px-2.5 py-2 text-xs font-semibold ${controlTextScrolled}`}
                  aria-expanded={showLangDropdown}
                  aria-haspopup="true"
                >
                  {languageOptions.find(l => l.code === language)?.short || "EN"}
                  <FaChevronDown size={9} className={`transition-transform duration-200 ${showLangDropdown ? "rotate-180" : ""}`} />
                </button>

                {showLangDropdown && (
                  <div className="dropdown-menu absolute right-0 mt-2 w-36 rounded-xl shadow-2xl z-50 overflow-hidden border"
                    style={{ background: "var(--card, white)", borderColor: "var(--card-border, #e5e7eb)" }}
                    role="listbox"
                  >
                    {languageOptions.map(({ code, label, short }) => (
                      <button
                        key={code}
                        onClick={() => { setLanguage(code); setShowLangDropdown(false); }}
                        className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-900/15 transition-colors"
                        style={{
                          color: language === code ? "#d4af37" : "var(--foreground)",
                          fontWeight: language === code ? 600 : 400,
                          background: language === code ? "rgba(212,175,55,0.06)" : "",
                        }}
                        role="option"
                        aria-selected={language === code}
                      >
                        <span>{label}</span>
                        <span className="text-xs opacity-50">{short}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`icon-btn p-2.5 ${controlTextScrolled}`}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light"
                  ? <FaMoon size={15} />
                  : <FaSun size={15} className="text-amber-400" />
                }
              </button>

              {/* Zoom Controls */}
              <div className={`zoom-control hidden sm:flex px-1 py-1 ${
                showTransparent ? "bg-white/10 backdrop-blur-sm" : "bg-gray-100 dark:bg-gray-800"
              }`}>
                <button
                  onClick={zoomOut}
                  className={`zoom-btn ${showTransparent ? "text-white/60" : "text-gray-500 dark:text-gray-400"}`}
                  aria-label="Zoom out"
                >
                  <FaSearchMinus size={11} />
                </button>
                <span className={`zoom-value ${showTransparent ? "text-white/80" : "text-gray-700 dark:text-gray-300"}`}>
                  {zoom}%
                </span>
                <button
                  onClick={zoomIn}
                  className={`zoom-btn ${showTransparent ? "text-white/60" : "text-gray-500 dark:text-gray-400"}`}
                  aria-label="Zoom in"
                >
                  <FaSearchPlus size={11} />
                </button>
              </div>

              {/* Auth buttons (desktop) */}
              {mounted && !isLoggedIn && (
                <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l"
                  style={{ borderColor: showTransparent ? "rgba(255,255,255,0.15)" : "var(--card-border, #e5e7eb)" }}
                >
                  <button
                    onClick={() => {
                      setAuthModalMode("login");
                      setShowAuthModal(true);
                    }}
                    className={`hidden sm:flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      showTransparent
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode("register");
                      setShowAuthModal(true);
                    }}
                    className="book-btn-header flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black rounded-lg"
                  >
                    <FaTicketAlt size={12} />
                    <span>Register</span>
                  </button>
                </div>
              )}

              {/* User Menu */}
              {mounted && isLoggedIn && (user || localUserData) && (
                <div className="relative ml-1" ref={userRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl transition-all ${
                      showTransparent 
                        ? "hover:bg-white/10 dark:hover:bg-white/5" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    aria-expanded={showUserDropdown}
                  >
                    {(user || localUserData)?.profileImage ? (
                      <img
                        src={(user || localUserData)?.profileImage}
                        alt={(user || localUserData)?.name}
                        className="w-8 h-8 rounded-full object-cover avatar-ring"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full avatar-ring flex items-center justify-center text-xs font-bold text-black"
                        style={{ background: "linear-gradient(135deg, #d4af37, #b8860b)" }}
                      >
                        {(user || localUserData)?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <FaChevronDown
                      size={9}
                      className={`transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`}
                      style={{ color: showTransparent ? "rgba(255,255,255,0.5)" : scrolled_muted }}
                    />
                  </button>

                  {showUserDropdown && (
                    <div className="dropdown-menu absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl z-50 overflow-hidden border"
                      style={{ background: "var(--card, white)", borderColor: "var(--card-border, #e5e7eb)" }}
                    >
                      {/* User info */}
                      <div className="px-4 py-4 border-b"
                        style={{ borderColor: "var(--card-border, #e5e7eb)", background: "var(--background, #fafafa)" }}
                      >
                        <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{(user || localUserData)?.name}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: scrolled_muted }}>{(user || localUserData)?.email}</p>
                      </div>

                      <div className="py-1.5">
                        {[
                          { href: "/public/profile", label: "My Profile", icon: "👤" },
                          { href: "/public/my-bookings", label: "My Bookings", icon: "🎟" },
                          ...((user || localUserData)?.role === "SUPER_ADMIN"
                            ? [{ href: "/admin/dashboard", label: "Admin Dashboard", icon: "⚙️" }]
                            : []),
                        ].map(({ href, label, icon }) => (
                          <a key={href} href={href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/15 transition-colors"
                            style={{ color: "var(--foreground)" }}
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <span>{icon}</span>
                            {label}
                          </a>
                        ))}
                      </div>

                      <div className="border-t py-1.5" style={{ borderColor: "var(--card-border, #e5e7eb)" }}>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors"
                        >
                          <FaSignOutAlt size={13} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className={`md:hidden icon-btn p-2.5 ml-1 ${
                  showTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label={showMobileMenu ? "Close menu" : "Open menu"}
                aria-expanded={showMobileMenu}
              >
                {showMobileMenu ? <FaTimes size={16} /> : <FaBars size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {showMobileMenu && (
          <>
            {/* Overlay */}
            <div
              className="mobile-overlay md:hidden fixed inset-0 top-[72px] bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Panel */}
            <div
              className="mobile-panel md:hidden absolute left-0 right-0 z-50 border-t shadow-2xl"
              style={{
                background: theme === "dark" ? "rgba(10,10,10,0.97)" : "rgba(255,255,255,0.98)",
                borderColor: "var(--card-border, #e5e7eb)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="px-4 py-5 space-y-1">

                {/* Zoom Controls — mobile */}
                <div className="flex items-center justify-between px-4 py-3 mb-1 rounded-xl"
                  style={{ background: "var(--card-border, rgba(0,0,0,0.05))" }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                    Text Size
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={zoomOut}
                      className="zoom-btn text-amber-600 dark:text-amber-400"
                      aria-label="Zoom out"
                    >
                      <FaSearchMinus size={12} />
                    </button>
                    <span className="zoom-value text-sm font-semibold px-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {zoom}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className="zoom-btn text-amber-600 dark:text-amber-400"
                      aria-label="Zoom in"
                    >
                      <FaSearchPlus size={12} />
                    </button>
                  </div>
                </div>

                {/* Nav links */}
                {navLinks.map((link) => {
                  const isMyBookings = link.label === "My Bookings";
                  return isMyBookings ? (
                    <button
                      key={link.label}
                      onClick={() => {
                        router.push(link.href);
                        setShowMobileMenu(false);
                      }}
                      className={`mobile-nav-link flex items-center w-full px-4 py-3 text-sm font-medium transition-all text-left ${
                        isActive(link.href) ? "active" : ""
                      }`}
                      style={{ color: isActive(link.href) ? "#d4af37" : "var(--foreground)" }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className={`mobile-nav-link flex items-center px-4 py-3 text-sm font-medium transition-all ${
                        isActive(link.href) ? "active" : ""
                      }`}
                      style={{ color: isActive(link.href) ? "#d4af37" : "var(--foreground)" }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {link.label}
                    </a>
                  );
                })}

                {/* Auth (mobile) */}
                {mounted && !isLoggedIn && (
                  <div className="flex gap-2 pt-4 pb-2">
                    <button
                      onClick={() => {
                        setAuthModalMode("login");
                        setShowAuthModal(true);
                        setShowMobileMenu(false);
                      }}
                      className="flex-1 py-3 text-center text-sm font-semibold rounded-xl border transition-all hover:border-amber-500"
                      style={{ borderColor: "var(--card-border, #e5e7eb)", color: "var(--foreground)" }}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalMode("register");
                        setShowAuthModal(true);
                        setShowMobileMenu(false);
                      }}
                      className="book-btn-header flex-1 py-3 text-center text-sm font-semibold text-black rounded-xl"
                    >
                      <span>Register</span>
                    </button>
                  </div>
                )}

                {/* User info (mobile) */}
                {mounted && (isAuthenticated || localUserData) && (user || localUserData) && (
                  <div className="pt-3 mt-3 border-t space-y-1" style={{ borderColor: "var(--card-border, #e5e7eb)" }}>
                    <div className="flex items-center gap-3 px-4 py-2.5 mb-2">
                      {(user || localUserData)?.profileImage ? (
                        <img src={(user || localUserData)?.profileImage} alt={(user || localUserData)?.name} className="w-9 h-9 rounded-full object-cover avatar-ring" />
                      ) : (
                        <div className="w-9 h-9 rounded-full avatar-ring flex items-center justify-center text-sm font-bold text-black"
                          style={{ background: "linear-gradient(135deg, #d4af37, #b8860b)" }}
                        >
                          {(user || localUserData)?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{(user || localUserData)?.name}</p>
                        <p className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>{(user || localUserData)?.email}</p>
                      </div>
                    </div>
                    {[
                      { href: "/public/profile", label: "My Profile" },
                      { href: "/public/my-bookings", label: "My Bookings" },
                      ...((user || localUserData)?.role === "SUPER_ADMIN" ? [{ href: "/admin/dashboard", label: "Admin Dashboard" }] : []),
                    ].map(({ href, label }) => (
                      <a key={href} href={href}
                        className="mobile-nav-link flex items-center px-4 py-3 text-sm"
                        style={{ color: "var(--foreground)" }}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {label}
                      </a>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="mobile-nav-link w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500"
                    >
                      <FaSignOutAlt size={13} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

export default Header;
