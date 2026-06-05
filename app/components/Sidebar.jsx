"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
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
  FaShoppingCart,
} from "react-icons/fa";
import { SiMyshows } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";

// Memoized Sidebar Item Component
const SidebarItem = memo(({ item, collapsed, isActive, onNavigate }) => {
  const Icon = item.icon;

  return (
    <li onClick={() => onNavigate(item.path)} className="group will-change-auto">
      <div
        className={`
          relative flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
          transition-all duration-300 ease-out
          ${
            isActive
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-300 hover:bg-gray-800"
          }
        `}
      >
        <Icon className="text-xl flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap">
            {item.name}
          </span>
        )}
      </div>
    </li>
  );
});

SidebarItem.displayName = "SidebarItem";

// Memoized Desktop Sidebar Content
const DesktopSidebarContent = memo(({ collapsed, menuItems, pathname, onNavigate, onLogout, title }) => (
  <div className="h-full flex flex-col bg-[#0f172a] will-change-auto">
    {/* Header */}
    <div className="flex-shrink-0 p-4 border-b border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between">
        {!collapsed ? (
          <h1 className="text-xl font-bold text-white">{title}</h1>
        ) : (
          <span className="text-2xl text-center block text-white">🎟</span>
        )}
      </div>
    </div>

    {/* Menu */}
    <div className="flex-1 p-3 overflow-hidden">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.name}
            item={item}
            collapsed={collapsed}
            isActive={pathname === item.path}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>

    {/* Logout Button */}
    <div className="flex-shrink-0 p-3 border-t border-gray-700 transition-all duration-300">
      <div
        onClick={onLogout}
        className={`
          flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
          text-gray-300 hover:bg-red-500/10 hover:text-red-400
          transition-all duration-300 ease-out
          ${!collapsed ? "justify-start" : "justify-center"}
        `}
      >
        <FaSignOutAlt className="text-xl flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium">Logout</span>
        )}
      </div>
    </div>
  </div>
));

DesktopSidebarContent.displayName = "DesktopSidebarContent";

// Memoized Mobile Sidebar Content
const MobileSidebarContent = memo(({ menuItems, pathname, onNavigate, onLogout, onClose, title }) => (
  <div className="h-full flex flex-col bg-[#0f172a] will-change-auto">
    <div className="flex-shrink-0 p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <FaTimes
          className="text-gray-400 cursor-pointer hover:text-white text-xl transition-colors"
          onClick={onClose}
        />
      </div>
    </div>

    <div className="flex-1 p-3 overflow-hidden">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.name} onClick={() => onNavigate(item.path)} className="group">
            <div
              className={`
                flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5
                transition-all duration-300 ease-out
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
        onClick={onLogout}
        className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 ease-out"
      >
        <FaSignOutAlt className="text-xl" />
        <span className="text-sm font-medium">Logout</span>
      </div>
    </div>
  </div>
));

MobileSidebarContent.displayName = "MobileSidebarContent";

export default function Sidebar({ sidebarOpen = true, setSidebarOpen = null }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use parent state if provided, otherwise manage local state
  const collapsed = setSidebarOpen !== null ? !sidebarOpen : isCollapsed;
  const setCollapsed = setSidebarOpen !== null ? (val) => setSidebarOpen(!val) : setIsCollapsed;

  // Debounced resize check - prevents excessive re-renders
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (!mobile && isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }, 150);
    };

    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.role || "");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const sidebarTitle = userRole === "SCANNING_USER" ? "Ticket Scanner" : "Super Admin";

  // Menu items - memoized to prevent recreation
  const menuItems = useMemo(
    () => {
      if (userRole === "SCANNING_USER") {
        return [
          { name: "Scan Ticket", path: "/admin/scan-ticket", icon: FaSprayCan }
        ];
      }
      return [
        { name: "Dashboard", path: "/admin/dashboard", icon: MdDashboard },
        { name: "Theaters", path: "/admin/theaters", icon: FaFilm },
        { name: "Shows", path: "/admin/shows", icon: SiMyshows },
        { name: "Users", path: "/admin/users", icon: FaUser },
        { name: "Admin", path: "/admin/theater-owners", icon: FaBars },
        { name: "Add Vendor", path: "/admin/vendors", icon: FaFilm },
        { name: "Scan Ticket", path: "/admin/scan-ticket", icon: FaSprayCan },
        { name: "Scanner Users", path: "/admin/scanner-users", icon: FaUser },
        { name: "Settings", path: "/admin/settings", icon: FaSellcast },
        { name: "Orders", path: "/admin/orders", icon: FaShoppingCart },
      ];
    },
    [userRole]
  );

  // Memoized callbacks to prevent unnecessary re-renders
  const handleNavigate = useCallback((path) => {
    router.push(path);
    if (isMobile) setIsMobileMenuOpen(false);
  }, [isMobile, router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  }, [router]);

  const handleCloseMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={handleOpenMenu}
          className="fixed top-4 left-4 z-50 p-2 bg-[#0f172a] rounded-lg shadow-lg hover:bg-[#1a2332] transition-colors will-change-auto"
          aria-label="Open menu"
        >
          <FaBars className="text-white text-xl" />
        </button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className="relative h-full bg-[#0f172a] shadow-xl z-40 flex-shrink-0"
          style={{
            width: collapsed ? "72px" : "240px",
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "width",
          }}
        >
          {/* Collapse Button */}
          <button
            onClick={handleToggleCollapse}
            className="absolute -right-3 top-20 bg-blue-600 p-1 rounded-full z-50 hover:bg-blue-700 transition-colors shadow-md will-change-auto"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <FaChevronRight className="text-white text-xs" />
            ) : (
              <FaChevronLeft className="text-white text-xs" />
            )}
          </button>

          <DesktopSidebarContent
            collapsed={collapsed}
            menuItems={menuItems}
            pathname={pathname}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            title={sidebarTitle}
          />
        </aside>
      )}

      {/* Mobile Drawer Overlay & Drawer */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out"
            onClick={handleCloseMenu}
            style={{ backdropFilter: "blur(4px)" }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Escape" && handleCloseMenu()}
          />
          <div
            className="fixed left-0 top-0 h-full w-64 bg-[#0f172a] z-50 shadow-xl"
            style={{
              transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
            <MobileSidebarContent
              menuItems={menuItems}
              pathname={pathname}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onClose={handleCloseMenu}
              title={sidebarTitle}
            />
          </div>
        </>
      )}
    </>
  );
}