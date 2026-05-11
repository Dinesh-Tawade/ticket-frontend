"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaUser,
  FaFilm,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSprayCan,
  FaSellcast,
} from "react-icons/fa";
import { SiMyshows } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Responsive check
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

  // Menu items
  const menuItems = useMemo(
    () => [
      { name: "Dashboard", path: "/admin/dashboard", icon: MdDashboard },
      { name: "Theaters", path: "/admin/theaters", icon: FaFilm },
      { name: "Shows", path: "/admin/shows", icon: SiMyshows },
      { name: "Users", path: "/admin/users", icon: FaUser },
      { name: "Add Theater Owner", path: "/admin/theater-owners", icon: FaBars },
      { name: "Scan Ticket", path: "/admin/scan-ticket", icon: FaSprayCan },
      { name: "Settings", path: "/admin/settings", icon: FaSellcast },
    ],
    []
  );

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  // Sidebar Item Component
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
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800"
            }
          `}
        >
          <Icon className="text-xl flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap">
              {item.name}
            </span>
          )}
        </div>
      </li>
    );
  };

  // Desktop Sidebar Content
  const DesktopSidebarContent = () => (
    <div className="h-full flex flex-col bg-[#0f172a]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-white">Super Admin</h1>
          ) : (
            <span className="text-2xl text-center block text-white">🎟</span>
          )}
        </div>
      </div>

      {/* Menu - NO SCROLL */}
      <div className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="flex-shrink-0 p-3 border-t border-gray-700">
        <div
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/admin/login");
          }}
          className={`
            flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
            text-gray-300 hover:bg-red-500/10 hover:text-red-400
            transition-all duration-300
            ${!isCollapsed ? "justify-start" : "justify-center"}
          `}
        >
          <FaSignOutAlt className="text-xl flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
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
          <h1 className="text-xl font-bold text-white">Super Admin</h1>
          <FaTimes
            className="text-gray-400 cursor-pointer hover:text-white text-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>

      <div className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name} onClick={() => handleNavigate(item.path)}>
              <div
                className={`
                  flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
                  transition-all duration-300
                  ${
                    pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }
                `}
              >
                <item.icon className="text-xl flex-shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-shrink-0 p-3 border-t border-gray-700">
        <div
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/admin/login");
          }}
          className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <FaSignOutAlt className="text-xl" />
          <span className="text-sm font-medium">Logout</span>
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
          className="fixed top-4 left-4 z-50 p-2 bg-[#0f172a] rounded-lg shadow-lg"
        >
          <FaBars className="text-white text-xl" />
        </button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className="fixed left-0 top-0 h-screen bg-[#0f172a] shadow-xl z-40 transition-all duration-300"
          style={{
            width: isCollapsed ? "72px" : "240px",
          }}
        >
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-blue-600 p-1 rounded-full z-50 hover:bg-blue-700 transition-colors shadow-md"
          >
            {isCollapsed ? (
              <FaChevronRight className="text-white text-xs" />
            ) : (
              <FaChevronLeft className="text-white text-xs" />
            )}
          </button>

          <DesktopSidebarContent />
        </aside>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 shadow-xl">
            <MobileSidebarContent />
          </div>
        </>
      )}
    </>
  );
}