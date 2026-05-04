"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaBuilding,
  FaFilm,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { GiTheaterCurtains } from "react-icons/gi";
import { useRouter, usePathname } from "next/navigation";

export default function TheaterOwnerSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Menu items
  const menuItems = useMemo(
    () => [
      { name: "Dashboard", path: "/theater-owner/dashboard", icon: MdDashboard },
      { name: "My Theater", path: "/theater-owner/theater", icon: FaBuilding },
      { name: "Shows", path: "/theater-owner/shows", icon: FaFilm },
      { name: "Bookings", path: "/theater-owner/bookings", icon: FaCalendarAlt },
    ],
    []
  );

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  // ✅ Sidebar Item Component
  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;

    return (
      <li onClick={() => handleNavigate(item.path)} className="group">
        <div
          className={`
            relative flex items-center gap-4 cursor-pointer rounded-lg px-4 py-3
            transition-all duration-300 overflow-hidden

            ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "text-gray-300"
            }
          `}
        >
          {/* Left Indicator */}
          <span
            className={`
              absolute left-0 top-0 h-full w-1 bg-blue-500
              transition-all duration-300
              ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
          />

          {/* Icon */}
          <Icon
            className={`
              text-lg transition-all duration-300
              ${
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1"
              }
            `}
          />

          {/* Text */}
          {(!isCollapsed || isMobile) && (
            <span
              className={`
                text-sm font-medium transition-all duration-300
                ${!isActive && "group-hover:translate-x-1"}
              `}
            >
              {item.name}
            </span>
          )}

          {/* Hover Background */}
          {!isActive && (
            <span className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg"></span>
          )}
        </div>
      </li>
    );
  };

  // ✅ Sidebar Content
  const SidebarContent = () => (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="mb-8 flex items-center justify-between">
          {(!isCollapsed || isMobile) ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <GiTheaterCurtains className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">
                  Theater Owner
                </h1>
                <p className="text-[10px] font-medium text-gray-400">
                  Manage your theater
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
              <GiTheaterCurtains className="text-white text-xl" />
            </div>
          )}

          {isMobile && (
            <FaTimes
              className="text-gray-400 cursor-pointer text-lg hover:text-white transition-colors flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>

        {/* Menu */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 p-3 bg-[#0f172a] rounded-lg shadow-lg"
        >
          <FaBars className="text-white text-lg" />
        </button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className="fixed left-0 top-0 h-screen bg-[#0f172a] transition-all duration-300 shadow-lg z-20"
          style={{ width: isCollapsed ? "80px" : "260px" }}
        >
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-blue-600 p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
          >
            <FaChevronRight
              className={`text-white text-xs transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>

          <SidebarContent />
        </aside>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 shadow-2xl">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Content spacing for desktop */}
      {!isMobile && (
        <div
          style={{ marginLeft: isCollapsed ? "80px" : "260px" }}
          className="transition-all duration-300"
        />
      )}
    </>
  );
}