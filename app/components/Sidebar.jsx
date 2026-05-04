"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaUser,
  FaBuilding,
  FaFilm,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaArrowsAlt,
} from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { SiMyshows } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
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

  // ✅ Menu
  const menuItems = useMemo(
    () => [
      { name: "Dashboard", path: "/admin/dashboard", icon: MdDashboard },
      { name: "Theaters", path: "/admin/theaters", icon: FaFilm },
      { name: "Shows", path: "/admin/shows", icon: SiMyshows },
      { name: "Users", path: "/admin/users", icon: FaUser },
    ],
    []
  );

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  // ✅ Sidebar Item
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
    <div className="h-full flex flex-col justify-between p-4">
      {/* Header */}
      <div>
        <div className="mb-8 flex items-center justify-between">
          {(!isCollapsed || isMobile) ? (
            <h1 className="text-3xl font-bold text-white">
              Super Admin
            </h1>
          ) : (
            <span className="text-xl mx-auto">🎟</span>
          )}

          {isMobile && (
            <FaTimes
              className="text-gray-400 cursor-pointer"
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
          className="fixed top-4 left-4 z-30 p-3 bg-[#0f172a] rounded-lg shadow"
        >
          <FaBars className="text-white" />
        </button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className="fixed left-0 top-0 h-screen overflow-y-auto bg-[#0f172a] transition-all duration-300 shadow-lg z-40"
          style={{
            width: isCollapsed ? "80px" : "260px",
            minWidth: isCollapsed ? "80px" : "260px",   // ✅ FIX
            maxWidth: isCollapsed ? "80px" : "260px",   // ✅ FIX
          }}
        >
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-blue-600 p-1 rounded-full z-50"
          >
            <FaChevronRight
              className={`text-white ${
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
          <div className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 overflow-y-auto">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Content spacing */}
      {!isMobile && (
        <div
          style={{
            marginLeft: isCollapsed ? "80px" : "260px",
            minWidth: "0", 
          }}
          className="transition-all duration-300"
        />
      )}
    </>
  );
}