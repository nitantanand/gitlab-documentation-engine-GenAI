"use client";

import { useSyncExternalStore } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { getServerTheme, getTheme, subscribeTheme, toggleTheme } from "@/lib/theme";

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
}

export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`btn btn-ghost btn-icon relative overflow-hidden ${className}`}
    >
      <FiSun
        aria-hidden="true"
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
      />
      <FiMoon
        aria-hidden="true"
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
    </button>
  );
}
