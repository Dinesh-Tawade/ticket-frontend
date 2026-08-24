"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser, logoutUser } from "@/app/store/slices/authSlice";

export default function useAuth(redirectTo = null) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Public routes that don't require authentication
  const isPublicRoute = (path) => {
    if (["/login", "/register", "/", "/public/shows", "/public/my-bookings"].includes(path)) {
      return true;
    }

    // Show detail pages are public, but booking remains protected.
    return /^\/public\/shows\/[^/]+$/.test(path || "");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isLoading]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicRoute = isPublicRoute(pathname);
    
    // Redirect to login if not authenticated and trying to access protected route
    if (!token && !publicRoute && pathname !== "/admin/login") {
      router.push(redirectTo || "/login");
    }
    
    // Redirect to home if authenticated and trying to access login/register
    if (token && (pathname === "/login" || pathname === "/register")) {
      router.push("/");
    }
  }, [pathname, router, redirectTo]);

  const logout = () => {
    dispatch(logoutUser());
    router.push("/");
  };

  return { user, isAuthenticated, isLoading, logout };
}
