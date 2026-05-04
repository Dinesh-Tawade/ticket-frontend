"use client";

import React, { useState } from "react";
import { FaEnvelope, FaPaperPlane, FaBell } from "react-icons/fa";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16"
          style={{ background: "var(--gradient-primary)" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "white" }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "white" }} />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <FaBell className="text-yellow-300" />
              <span className="text-sm font-medium text-white">Stay Updated</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Never Miss a Premiere
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get exclusive updates on new releases, special offers, and early access to tickets.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 outline-none focus:bg-white/30 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="px-6 py-4 rounded-xl font-semibold bg-white text-gray-900 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-70"
                >
                  {isSubmitted ? (
                    <>Subscribed!</>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Subscribe
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-sm text-white/60">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-white/70">Subscribers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">200+</div>
                <div className="text-sm text-white/70">Movies/Year</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-white/70">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
