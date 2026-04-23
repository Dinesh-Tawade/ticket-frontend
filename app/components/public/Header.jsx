"use client";

import React, { useState } from "react";
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

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide cursor-pointer" onClick={() => window.location.href = "/"}>
          {t("app.title")}
        </h1>

        {/* Nav */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <span className="hover:text-yellow-400 cursor-pointer" onClick={() => window.location.href = "/"}>
            {t("app.home")}
          </span>
          <span className="hover:text-yellow-400 cursor-pointer">
            {t("app.about")}
          </span>
          <span className="hover:text-yellow-400 cursor-pointer">
            {t("app.contact")}
          </span>
          {!isAuthenticated ? (
            <>
              <a href="../../pages/Authentication/login" className="hover:text-yellow-400 cursor-pointer">
                {t("app.login")}
              </a>
              <a href="../../pages/Authentication/register" className="hover:text-yellow-400 cursor-pointer">
                {t("app.register")}
              </a>
            </>
          ) : null}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">

          {/* 🌐 Language */}
          <select
            onChange={handleLanguageChange}
            value={language}
            className="bg-gray-700 px-2 py-1 rounded text-sm cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="mr">MR</option>
          </select>

          {/* 🌙 Theme */}
          <button
            onClick={toggleTheme}
            className="bg-gray-700 p-2 rounded hover:bg-gray-600"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {/* 🔍 Zoom */}
          <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded">
            <button onClick={zoomOut} className="hover:text-yellow-400">
              <FaSearchMinus />
            </button>
            <span className="text-xs w-10 text-center">{zoom}%</span>
            <button onClick={zoomIn} className="hover:text-yellow-400">
              <FaSearchPlus />
            </button>
          </div>

          {/* 👤 User Profile - Only when logged in */}
          {isAuthenticated && user && (
            <div 
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-xl" />
                )}
                <span className="text-sm hidden sm:inline">{user.name?.split(" ")[0]}</span>
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Role: <span className="font-medium">{user.role}</span>
                      </p>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      My Profile
                    </a>
                    <a href="/my-bookings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      My Bookings
                    </a>
                    {user.role === "SUPER_ADMIN" && (
                      <a href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Admin Dashboard
                      </a>
                    )}
                    <hr className="my-1 dark:border-gray-700" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
    </header>
  );
}

export default Header;