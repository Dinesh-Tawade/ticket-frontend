// Update your TheaterOwnerSidebar.js - Add this to notify layout about collapse state
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

  // Load saved collapse state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapse state and notify layout
  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Dispatch event to notify layout
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { collapsed: newState } 
    }));
  };

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [pathname, isMobile]);

  // Menu items 
  const menuItems = useMemo(
    () => [
      { name: "Dashboard", path: "/theater-owner/dashboard", icon: MdDashboard },
      { name: "Shows", path: "/theater-owner/shows", icon: FaFilm },
      { name: "Booked Tickets", path: "/theater-owner/bookings", icon: FaCalendarAlt },
    ],
    []
  );

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sidebarCollapsed");
    router.push("/login");
  };

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
          <span
            className={`
              absolute left-0 top-0 h-full w-1 bg-blue-500
              transition-all duration-300
              ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
          />

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

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
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
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </ul>
      </div>

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

      <div className="flex-1 p-3 overflow-y-auto">
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
      {isMobile && !isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 p-2.5 bg-[#0f172a] rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <FaBars className="text-white text-lg" />
        </button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <>
          <aside
            className="fixed left-0 top-0 h-screen bg-[#0f172a] transition-all duration-300 shadow-xl z-20"
            style={{ width: isCollapsed ? "72px" : "240px" }}
          >
            <button
              onClick={handleCollapseToggle}
              className="absolute -right-3 top-20 bg-blue-600 p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <FaChevronRight className="text-white text-xs" />
              ) : (
                <FaChevronLeft className="text-white text-xs" />
              )}
            </button>

            <SidebarContent />
          </aside>

          {/* Spacer div for layout */}
          <div style={{ display: 'none' }} />
        </>
      )}

      {/* Mobile Drawer */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 shadow-2xl animate-slideIn">
            <MobileSidebarContent />
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}