"use client";

import React from "react";
import "../../../i18n";

import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaLock,
  FaBolt,
} from "react-icons/fa";

import { useTranslation } from "react-i18next";

function Hero() {
  const { t } = useTranslation();

  return (
    <section
      className="relative 
      bg-gradient-to-r from-blue-600 to-indigo-700 
      dark:from-gray-900 dark:to-black 
      text-white"
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>

      <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <FaTicketAlt className="text-yellow-300" />
          {t("app.title") || "Book Your Tickets Easily"}
        </h1>

        <p className="text-lg md:text-xl mb-8 text-gray-200">
          {t("app.subtitle") || "Fast, secure and reliable ticket booking platform"}
        </p>

        <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow-lg p-4 md:p-6 max-w-4xl mx-auto">

          <div className="grid md:grid-cols-3 gap-4">

            <div className="flex items-center border dark:border-gray-600 rounded px-3 py-2">
              <FaMapMarkerAlt className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder={t("app.from") || "From"}
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border dark:border-gray-600 rounded px-3 py-2">
              <FaMapMarkerAlt className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder={t("app.to") || "To"} // ✅ FIXED
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border dark:border-gray-600 rounded px-3 py-2">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input
                type="date"
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>

          <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <FaTicketAlt />
            {t("app.search") || "Search Tickets"}
          </button>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6 text-sm text-gray-200">
          <div className="flex items-center justify-center gap-2">
            <FaCheckCircle className="text-green-400" />
            Easy Booking
          </div>
          <div className="flex items-center justify-center gap-2">
            <FaLock className="text-blue-400" />
            Secure Payments
          </div>
          <div className="flex items-center justify-center gap-2">
            <FaBolt className="text-yellow-400" />
            Instant Confirmation
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;