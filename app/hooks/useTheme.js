"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, setTheme } from "@/app/store/slices/themeSlice";

export default function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved && saved !== theme) {
      dispatch(setTheme(saved));
    }
  }, [dispatch, theme]);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => {
    dispatch(toggleTheme());
  };

  return { theme, toggleTheme: toggle };
}