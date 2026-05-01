"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaMoon, FaSun, FaSearchPlus, FaSearchMinus, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "../../i18n";
import useTheme from "@/app/hooks/useTheme";
import useZoom from "@/app/hooks/useZoom";
import useAuth from "@/app/hooks/useAuth";
import useLanguage from "@/app/hooks/useLanguage";

function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { zoom, zoomIn, zoomOut } = useZoom();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef(null);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  const languageLabels = {
    en: "EN",
    hi: "HI",
    mr: "MR",
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };

    if (showLangDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLangDropdown]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/30 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <h1
            className="text-2xl md:text-3xl font-extrabold tracking-tight cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = "/"}
          >
            {t("app.title")}
          </h1>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t("app.home")}
            </a>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {t("app.about")}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {t("app.contact")}
            </span>

            {!isAuthenticated ? (
              <div className="flex items-center gap-3 ml-2">
                <a
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200"
                >
                  {t("app.login")}
                </a>
                <a
                  href="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                >
                  {t("app.register")}
                </a>
              </div>
            ) : null}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-3">

            {/* Language */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 min-w-[60px]"
              >
                {languageLabels[language]}
              </button>

              {/* Language Dropdown */}
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="py-1">
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                          language === code
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
            >
              {theme === "light" ? <FaMoon className="text-lg" /> : <FaSun className="text-lg text-yellow-400" />}
            </button>

            {/* Zoom */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-600">
              <button onClick={zoomOut} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                <FaSearchMinus />
              </button>
              <span className="text-xs w-10 text-center text-gray-700 dark:text-gray-300">{zoom}%</span>
              <button onClick={zoomIn} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                <FaSearchPlus />
              </button>
            </div>

            {/* User Profile - Only when logged in */}
            {isAuthenticated && user && (
              <div
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-all">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-xl text-gray-600 dark:text-gray-300" />
                  )}
                  <span className="text-sm hidden sm:inline text-gray-700 dark:text-gray-200">{user.name?.split(" ")[0]}</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Role: <span className="font-medium">{user.role}</span>
                        </p>
                      </div>
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        My Profile
                      </a>
                      <a href="/my-bookings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        My Bookings
                      </a>
                      {user.role === "SUPER_ADMIN" && (
                        <a href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                          Admin Dashboard
                        </a>
                      )}
                      <hr className="my-1 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;