"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaBuilding,
  FaFilm,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaChevronLeft,
  FaCalendarAlt,
  FaSignOutAlt,
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
      // { name: "Ticket Scan", path: "/theater-owner/ticket-scan", icon: GiTheaterCurtains },
      { name: "Settings", path: "/theater-owner/settings", icon: FaBars },
    ],
    []
  );

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ✅ Sidebar Item Component
  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;

    return (
      <li onClick={() => handleNavigate(item.path)} className="group">
        <div
          className={`
            relative flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
            transition-all duration-300
            ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800"
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
              text-lg transition-all duration-300 flex-shrink-0
              ${
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-blue-400"
              }
            `}
          />

          {/* Text */}
          {!isCollapsed && (
            <span
              className={`
                text-sm font-medium transition-all duration-300 whitespace-nowrap
                ${!isActive && "group-hover:translate-x-1"}
              `}
            >
              {item.name}
            </span>
          )}
        </div>
      </li>
    );
  };

  // ✅ Sidebar Content - FIXED: No overflow-y-auto on entire sidebar
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <GiTheaterCurtains className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">
                  Theater Owner
                </h1>
                <p className="text-[9px] font-medium text-gray-400">
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
      </div>

      {/* Menu - NO SCROLLBAR, just normal flow */}
      <div className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </ul>
      </div>

      {/* Logout Button - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 border-t border-gray-700">
        <div
          onClick={handleLogout}
          className={`
            flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
            text-gray-300 hover:bg-red-500/10 hover:text-red-400
            transition-all duration-300
            ${!isCollapsed ? "justify-start" : "justify-center"}
          `}
        >
          <FaSignOutAlt className="text-lg flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap">Logout</span>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar Content
  const MobileSidebarContent = () => (
    <div className="h-full flex flex-col bg-[#0f172a]">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
              <GiTheaterCurtains className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">
                Theater Owner
              </h1>
              <p className="text-[9px] font-medium text-gray-400">
                Manage your theater
              </p>
            </div>
          </div>
          <FaTimes
            className="text-gray-400 cursor-pointer text-lg hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>

      <div className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <li key={item.name} onClick={() => handleNavigate(item.path)}>
                <div
                  className={`
                    flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800"
                    }
                  `}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex-shrink-0 p-3 border-t border-gray-700">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <FaSignOutAlt className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">Logout</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 p-2.5 bg-[#0f172a] rounded-lg shadow-lg"
        >
          <FaBars className="text-white text-lg" />
        </button>
      )}

      {/* Desktop Sidebar - FIXED: No overflow properties */}
      {!isMobile && (
        <>
          <aside
            className="fixed left-0 top-0 h-screen bg-[#0f172a] transition-all duration-300 shadow-xl z-20"
            style={{ width: isCollapsed ? "72px" : "240px" }}
          >
            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-20 bg-blue-600 p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
            >
              {isCollapsed ? (
                <FaChevronRight className="text-white text-xs" />
              ) : (
                <FaChevronLeft className="text-white text-xs" />
              )}
            </button>

            <SidebarContent />
          </aside>

          {/* Spacer div to push main content - CRITICAL */}
          <div
            style={{ width: isCollapsed ? "72px" : "240px", flexShrink: 0 }}
            className="transition-all duration-300"
          />
        </>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 shadow-2xl">
            <MobileSidebarContent />
          </div>
        </>
      )}
    </>
  );
}