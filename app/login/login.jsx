"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { userLogin } from "@/app/services/publicCommunication";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => userLogin(email, password),

    onSuccess: (res) => {
      console.log("FULL RESPONSE:", res);

      let user = res?.data || res?.user;
      let token = res?.data?.token || res?.token;
      
      if (!user && res?.token) {
        user = res;
        token = res.token;
      }

      if (!user) {
        toast.error("Invalid response from server");
        console.error("Response structure:", res);
        return;
      }

      if (token) {
        localStorage.setItem("token", token);
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      toast.success("Logged in successfully!");

      const role = user?.role?.trim().toUpperCase();
      
      console.log("User role:", role);

      setTimeout(() => {
        if (role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else if (role === "SELLER") {
          router.push("/seller/dashboard");
        } else if (role === "THEATER_OWNER") {
          router.push("/theater-owner/dashboard");
        } else if (role === "BUYER") {
          router.push("/");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 100);
    },

    onError: (error) => {
      console.log("Login error:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (loginMutation.isPending) return;

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full animate-pulse bg-blue-600/15 blur-[60px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full animate-pulse delay-500 bg-blue-700/10 blur-[60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-pulse delay-1000 bg-blue-500/8 blur-[80px]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-transform hover:scale-105 duration-300 bg-gradient-to-br from-blue-600 to-blue-800">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Welcome Back
          </h2>
          <p className="text-sm mt-1 text-[var(--text-tertiary)]">
            Sign in to continue
          </p>
        </div>

        {/* Email Field */}
        <div className="mb-5">
          <label className={`text-sm font-medium transition-all duration-200 block mb-1 ${isFocusedEmail ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
            Email Address
          </label>
          <div className="relative">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${isFocusedEmail || email ? 'opacity-100' : 'opacity-50'}`}>
              <svg className={`w-5 h-5 ${isFocusedEmail ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedEmail ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label className={`text-sm font-medium transition-all duration-200 block mb-1 ${isFocusedPassword ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
            Password
          </label>
          <div className="relative">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${isFocusedPassword || password ? 'opacity-100' : 'opacity-50'}`}>
              <svg className={`w-5 h-5 ${isFocusedPassword ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsFocusedPassword(true)}
              onBlur={() => setIsFocusedPassword(false)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedPassword ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
              required
            />
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right mb-6">
          <Link href="/forgot-password" className="text-sm transition-all duration-200 hover:underline text-blue-600">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loginMutation.isPending ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>

        {/* Register Link */}
        <p className="text-sm text-center mt-6 pt-4 border-t text-[var(--text-tertiary)] border-[var(--border-light)]">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold transition-all duration-200 hover:underline text-blue-600"
          >
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}