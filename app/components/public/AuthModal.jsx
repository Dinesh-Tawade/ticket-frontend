"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTimes,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaTicketAlt,
  FaStar,
  FaCheckCircle,
  FaUpload,
} from "react-icons/fa";
import { loginUser, registerUser, clearAuth } from "@/app/store/slices/authSlice";

function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [mode, setMode] = useState(initialMode); // "login" or "register"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSuccessMessage("");
      setLoginForm({ email: "", password: "" });
      setRegisterForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
      });
      setProfileImage(null);
      setPreviewImage(null);
      dispatch(clearAuth());
    }
  }, [isOpen, initialMode, dispatch]);

  // Handle successful auth
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      setSuccessMessage(mode === "login" ? "Welcome back!" : "Account created successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isAuthenticated, isOpen, mode, onClose]);

  // Handle successful registration - switch to login
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !error && registerSuccess && mode === "register") {
      setSuccessMessage("Account created! Please sign in.");
      setTimeout(() => {
        setMode("login");
        setSuccessMessage("");
        setRegisterSuccess(false);
      }, 2000);
    }
  }, [isLoading, error, registerSuccess, mode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(loginForm));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }

    const formData = new FormData();
    formData.append("name", registerForm.name);
    formData.append("email", registerForm.email);
    formData.append("phone", registerForm.phone);
    formData.append("password", registerForm.password);
    formData.append("confirmPassword", registerForm.confirmPassword);
    formData.append("address", registerForm.address);
    if (profileImage) {
      formData.append("profilePicture", profileImage);
    }

    dispatch(registerUser(formData));
    setRegisterSuccess(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: "linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        {/* Gold Top Accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #d4af37, #f4d03f, #d4af37)" }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 z-10"
          style={{ background: "rgba(212,175,55,0.1)" }}
        >
          <FaTimes className="text-[#d4af37]" size={14} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #d4af37, #b8860b)" }}
              >
                <FaTicketAlt className="text-black text-xl" />
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-white/50">
              {mode === "login"
                ? "Sign in to book your premium experience"
                : "Join us for exclusive cinema experiences"}
            </p>
          </div>

          {/* Messages - sticky at top */}
          <div className="sticky top-0 z-20 space-y-3 mb-6">
            {successMessage && (
              <div
                className="p-4 rounded-xl flex items-center gap-3 animate-pulse"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)" }}
              >
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm text-green-400 font-medium">{successMessage}</span>
              </div>
            )}

            {error && (
              <div
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}
              >
                <span className="text-red-400 mt-0.5">⚠</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={16} />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-[#d4af37] hover:text-[#f4d03f] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #b8860b)",
                  color: "#000",
                  boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <FaTicketAlt size={14} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ 
                      background: previewImage ? "transparent" : "rgba(212,175,55,0.1)",
                      border: "2px dashed rgba(212,175,55,0.4)"
                    }}
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FaUpload className="text-[#d4af37]/60" size={24} />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {previewImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null);
                        setPreviewImage(null);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <FaTimes size={10} className="text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={16} />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={14} />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="Email"
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                    Phone
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={14} />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Create password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/60" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Address
                </label>
                <textarea
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  placeholder="Enter your address"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300 resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || registerForm.password !== registerForm.confirmPassword}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-70 mt-2"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #b8860b)",
                  color: "#000",
                  boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <FaStar size={14} />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Gold Divider */}
          <div className="mt-8 mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <FaStar className="text-[#d4af37]/40" size={10} />
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-white/50">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-[#d4af37] hover:text-[#f4d03f] font-semibold transition-colors"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
