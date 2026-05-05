"use client";

import React, { useState } from "react";
import { FaEnvelope, FaPaperPlane, FaBell, FaStar } from "react-icons/fa";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Dark Cinematic Background */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: "linear-gradient(160deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)" 
            }}
          />
          
          {/* Gold Glow Effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(212,175,55,0.15) 0%, transparent 70%)"
            }}
          />

          {/* Background Pattern - Film Strip */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute top-0 left-1/4 w-px h-full" 
              style={{ background: "repeating-linear-gradient(to bottom, #d4af37 0, #d4af37 8px, transparent 8px, transparent 16px)" }}
            />
            <div 
              className="absolute top-0 right-1/4 w-px h-full" 
              style={{ background: "repeating-linear-gradient(to bottom, #d4af37 0, #d4af37 8px, transparent 8px, transparent 16px)" }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center py-16 px-8 md:py-20 md:px-12">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d4af37]">
                Stay in the Spotlight
              </span>
              <div className="w-8 h-px bg-linear-to-r from-transparent via-[#d4af37] to-transparent" />
            </div>

            {/* Title */}
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Never Miss a Premiere
            </h2>
            
            <p className="text-base md:text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
              Subscribe to our newsletter for exclusive updates on new releases, 
              special offers, and early access to premium tickets.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #b8860b)",
                    color: "#000",
                    boxShadow: "0 4px 20px rgba(212,175,55,0.35)"
                  }}
                >
                  {isSubmitted ? (
                    <>
                      <FaStar size={14} />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={14} />
                      Subscribe
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-xs text-white/30 tracking-wide">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>

            {/* Gold Divider */}
            <div className="mt-12 mb-8 flex items-center justify-center gap-4">
              <div className="h-px flex-1 max-w-[100px] bg-linear-to-r from-transparent to-[#d4af37]/30" />
              <FaStar className="text-[#d4af37]/40" size={12} />
              <div className="h-px flex-1 max-w-[100px] bg-linear-to-l from-transparent to-[#d4af37]/30" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div 
                  className="text-3xl md:text-4xl font-bold"
                  style={{ 
                    color: "#d4af37",
                    fontFamily: "'Playfair Display', serif" 
                  }}
                >
                  50K+
                </div>
                <div className="text-xs text-white/40 mt-1 tracking-wide uppercase">Subscribers</div>
              </div>
              <div>
                <div 
                  className="text-3xl md:text-4xl font-bold"
                  style={{ 
                    color: "#d4af37",
                    fontFamily: "'Playfair Display', serif" 
                  }}
                >
                  200+
                </div>
                <div className="text-xs text-white/40 mt-1 tracking-wide uppercase">Movies/Year</div>
              </div>
              <div>
                <div 
                  className="text-3xl md:text-4xl font-bold"
                  style={{ 
                    color: "#d4af37",
                    fontFamily: "'Playfair Display', serif" 
                  }}
                >
                  98%
                </div>
                <div className="text-xs text-white/40 mt-1 tracking-wide uppercase">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
