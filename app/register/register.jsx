"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { userRegister } from "@/app/services/publicCommunication";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "BUYER",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);
  const [isFocusedAddress, setIsFocusedAddress] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("confirmPassword", form.confirmPassword);
      formData.append("address", form.address.trim());
      formData.append("role", form.role);

      if (file) {
        formData.append("profileImage", file);
      }

      return userRegister(formData);
    },

    onSuccess: () => {
      toast.success("Registered successfully!");
      
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        role: "BUYER",
      });
      
      setFile(null);
      setPreview(null);
      
      router.push("/login");
    },

    onError: (error) => {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        "Registration failed"
      );
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerMutation.isPending) return;

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full animate-pulse bg-blue-600/15 blur-[60px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full animate-pulse delay-500 bg-blue-700/10 blur-[60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-pulse delay-1000 bg-blue-500/8 blur-[80px]" />
      </div>

      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Create Account
          </h2>
          <p className="text-sm mt-2 text-[var(--text-tertiary)]">
            Join us today and start your journey
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl shadow-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column - Form Fields */}
            <div className="p-8 border-r border-[var(--border-light)]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Personal Information</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Fill your basic details</p>
              </div>

              {/* Name Field */}
              <div className="mb-5">
                <label className={`text-sm font-medium transition-all duration-200 block mb-2 ${isFocusedName ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-all duration-200 ${isFocusedName || form.name ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setIsFocusedName(true)}
                    onBlur={() => setIsFocusedName(false)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedName ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-5">
                <label className={`text-sm font-medium transition-all duration-200 block mb-2 ${isFocusedEmail ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-all duration-200 ${isFocusedEmail || form.email ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setIsFocusedEmail(true)}
                    onBlur={() => setIsFocusedEmail(false)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedEmail ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label className={`text-sm font-medium transition-all duration-200 block mb-2 ${isFocusedPassword ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
                  Password * (min. 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-all duration-200 ${isFocusedPassword || form.password ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setIsFocusedPassword(true)}
                    onBlur={() => setIsFocusedPassword(false)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedPassword ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-5">
                <label className={`text-sm font-medium transition-all duration-200 block mb-2 ${isFocusedConfirm ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-5 h-5 transition-all duration-200 ${isFocusedConfirm || form.confirmPassword ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setIsFocusedConfirm(true)}
                    onBlur={() => setIsFocusedConfirm(false)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedConfirm ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="p-8 bg-[var(--bg-secondary)]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Additional Information</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Tell us more about yourself</p>
              </div>

              {/* Address Field */}
              <div className="mb-5">
                <label className={`text-sm font-medium transition-all duration-200 block mb-2 ${isFocusedAddress ? 'text-blue-600' : 'text-[var(--text-secondary)]'}`}>
                  Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3">
                    <svg className={`w-5 h-5 transition-all duration-200 ${isFocusedAddress || form.address ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <textarea
                    name="address"
                    placeholder="Enter your address"
                    value={form.address}
                    onChange={handleChange}
                    onFocus={() => setIsFocusedAddress(true)}
                    onBlur={() => setIsFocusedAddress(false)}
                    rows="4"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-2 ${isFocusedAddress ? 'border-blue-600' : 'border-[var(--border-light)]'}`}
                  />
                </div>
              </div>

              {/* Role - Fixed as BUYER */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">
                  Account Type
                </label>
                <div className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border-2 border-[var(--border-light)] text-[var(--text-primary)] flex items-center gap-2">
                  <span className="font-semibold">BUYER</span>
                  <span className="text-xs text-[var(--text-tertiary)] ml-auto">(Default)</span>
                </div>
                <input type="hidden" name="role" value="BUYER" />
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  All new accounts are created as BUYER by default
                </p>
              </div>

              {/* Profile Image */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">
                  Profile Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-light)] text-center hover:border-blue-600 transition-all duration-200">
                      <svg className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-[var(--text-tertiary)]">Click to upload</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {preview && (
                    <div className="flex-shrink-0">
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-600 shadow-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Buttons */}
          <div className="p-8 border-t border-[var(--border-light)] bg-[var(--bg-elevated)]">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {registerMutation.isPending ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>

            <p className="text-sm text-center mt-4 text-[var(--text-tertiary)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold transition-all duration-200 hover:underline text-blue-600"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}