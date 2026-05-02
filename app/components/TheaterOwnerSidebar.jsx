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
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";

export default function TheaterOwnerSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const menuItems = useMemo(
    () => [
      { name: "Dashboard", path: "/theater-owner/dashboard", icon: MdDashboard },
      { name: "My Theater", path: "/theater-owner/theater", icon: FaBuilding },
      { name: "Shows", path: "/theater-owner/shows", icon: FaFilm },
      { name: "Bookings", path: "/theater-owner/bookings", icon: FaCalendarAlt },
      { name: "Analytics", path: "/theater-owner/analytics", icon: FaChartLine },
    ],
    []
  );

  const handleNavigate = (path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

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
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                : "text-gray-300"
            }
          `}
        >
          <span
            className={`
              absolute left-0 top-0 h-full w-1 bg-purple-500
              transition-all duration-300
              ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
          />

          <Icon
            className={`
              text-lg transition-all duration-300
              ${
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1"
              }
            `}
          />

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

          {!isActive && (
            <span className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg"></span>
          )}
        </div>
      </li>
    );
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between p-4">
      <div>
        <div className="mb-8 flex items-center justify-between">
          {(!isCollapsed || isMobile) ? (
            <div>
              <h1 className="text-2xl font-bold text-white">Theater Owner</h1>
              <p className="text-xs text-gray-400 mt-1">Manage your theater</p>
            </div>
          ) : (
            <span className="text-xl mx-auto">🎭</span>
          )}

          {isMobile && (
            <FaTimes
              className="text-gray-400 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>

        <ul className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-2">
        <div
          onClick={() => handleNavigate("/theater-owner/profile")}
          className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer text-gray-300 hover:bg-purple-500/20 transition"
        >
          <FaUser />
          {(!isCollapsed || isMobile) && <span>Profile</span>}
        </div>

        <div
          onClick={logout}
          className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer text-red-400 hover:bg-red-500/20 transition"
        >
          <FaSignOutAlt />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 p-3 bg-[#0f172a] rounded-lg shadow"
        >
          <FaBars className="text-white" />
        </button>
      )}

      {!isMobile && (
        <aside
          className="fixed left-0 top-0 h-screen bg-[#0f172a] transition-all duration-300 shadow-lg"
          style={{ width: isCollapsed ? "80px" : "260px" }}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-purple-600 p-1 rounded-full"
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

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50">
            <SidebarContent />
          </div>
        </>
      )}

      {!isMobile && (
        <div
          style={{ marginLeft: isCollapsed ? "80px" : "260px" }}
          className="transition-all duration-300"
        />
      )}
    </>
  );
}
