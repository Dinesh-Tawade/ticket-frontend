
"use client";

import { useSelector } from "react-redux";
import useTheme from "@/app/hooks/useTheme";

function formatRole(role) {
  if (!role) return "";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

const navLinks = [
  // { label: "Overview", active: true },
  // { label: "Users" },
  // { label: "Alerts", badge: 4 },
  // { label: "Settings" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const isDark = theme === "dark";

  return (
    <nav
      className="sticky top-0 z-10 w-full border-b transition-colors duration-200"
      style={{
        background: "var(--background)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-7 h-[60px] flex items-center justify-between">

        {/* Brand */}
        <a href="/" className="flex items-center gap-3 no-underline">
          <div className="relative w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
            <svg className="relative z-10" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </div>
          <div>
            <p
              className="text-[15px] font-bold tracking-tight leading-none transition-colors duration-200"
              style={{ color: "var(--foreground)" }}
            >
              AdminOS
            </p>
            <p
              className="text-[11px] tracking-wide leading-none mt-0.5 transition-colors duration-200"
              style={{ color: "var(--blue)", opacity: 0.7 }}
            >
              System console
            </p>
          </div>
        </a>

        {/* Nav Links */}
        <div className="flex items-center gap-0.5">
          {navLinks.map(({ label, active, badge }) => (
            <a
              key={label}
              href="#"
              className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-lg text-[13px] font-medium transition-all duration-100 border"
              style={{
                color: active ? "var(--purple)" : "var(--foreground)",
                background: active ? "var(--card)" : "transparent",
                borderColor: active ? "var(--purple)" : "transparent",
                opacity: active ? 1 : 0.6,
              }}
            >
              {active && (
                <span className="w-[5px] h-[5px] rounded-full bg-[#6c5ce7] flex-shrink-0" />
              )}
              {label}
              {badge && (
                <span className="text-[10px] font-semibold bg-[#6c5ce7] text-white rounded px-1 py-px leading-snug">
                  {badge}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <button
            className="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg border text-[13px] font-medium transition-all"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Search
            <span
              className="text-[10px] ml-0.5"
              style={{ color: "var(--foreground)", opacity: 0.4 }}
            >
              ⌘K
            </span>
          </button>

          <div
            className="w-px h-5 transition-colors duration-200"
            style={{ background: "var(--card-border)" }}
          />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border transition-all hover:rotate-[15deg]"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
          >
            {isDark ? (
              /* Sun icon — shown in dark mode to switch to light */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </svg>
            ) : (
              /* Moon icon — shown in light mode to switch to dark */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            )}
          </button>

          <div
            className="w-px h-5 transition-colors duration-200"
            style={{ background: "var(--card-border)" }}
          />

          {/* User chip */}
          {user && (
            <div
              className="flex items-center gap-2.5 h-[34px] pl-1.5 pr-2.5 rounded-[10px] border cursor-pointer transition-all"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
              }}
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-[26px] h-[26px] rounded-md object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-[#6c5ce7] to-[#a855f7] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="hidden sm:block">
                <p
                  className="text-[12.5px] font-medium leading-none transition-colors duration-200"
                  style={{ color: "var(--foreground)" }}
                >
                  {user.name || "User"}
                </p>
                <p
                  className="text-[10px] leading-none mt-0.5 flex items-center gap-1 transition-colors duration-200"
                  style={{ color: "var(--foreground)", opacity: 0.6 }}
                >
                  <span className="w-[5px] h-[5px] rounded-full bg-[#22d37e] flex-shrink-0" />
                  {formatRole(user.role)}
                </p>
              </div>
              <svg
                className="ml-0.5"
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                style={{ color: "var(--foreground)", opacity: 0.4 }}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}