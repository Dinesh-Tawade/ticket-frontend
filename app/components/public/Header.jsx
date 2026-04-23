"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import "../../i18n";

import { FaMoon, FaSun, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

import useTheme from "@/app/hooks/useTheme";
import useZoom from "@/app/hooks/useZoom";

function Header() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { zoom, zoomIn, zoomOut } = useZoom();

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide">
          {t("app.title")}
        </h1>

        {/* Nav */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <span className="hover:text-yellow-400 cursor-pointer">
            {t("app.home")}
          </span>
          <span className="hover:text-yellow-400 cursor-pointer">
            {t("app.about")}
          </span>
          <span className="hover:text-yellow-400 cursor-pointer">
            {t("app.contact")}

          </span>
          <a
            href="../../pages/Authentication/login"
            className="hover:text-yellow-400 cursor-pointer"
          >
            {t("app.login")}
          </a>
          <span>

            <a
              href="../../pages/Authentication/register"
              className="hover:text-yellow-400 cursor-pointer"
            >
              {t("app.register")}
            </a>
          </span>

        </nav>




        {/* Controls */}
        <div className="flex items-center gap-3">

          {/* 🌐 Language */}
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-gray-700 px-2 py-1 rounded text-sm"
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
            <button onClick={zoomOut}>
              <FaSearchMinus />
            </button>

            <span className="text-xs">{zoom}%</span>

            <button onClick={zoomIn}>
              <FaSearchPlus />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;