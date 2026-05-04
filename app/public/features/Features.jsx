"use client";

import React from "react";
import {
  FaTicketAlt,
  FaMobileAlt,
  FaShieldAlt,
  FaHeadset,
  FaPercent,
  FaClock,
} from "react-icons/fa";

const features = [
  {
    icon: FaTicketAlt,
    title: "Easy Booking",
    description: "Book your movie tickets in just a few clicks with our streamlined booking process.",
    color: "var(--blue)",
  },
  {
    icon: FaMobileAlt,
    title: "Mobile Tickets",
    description: "Show your tickets directly from your phone. No printing needed, ever.",
    color: "var(--purple)",
  },
  {
    icon: FaShieldAlt,
    title: "Secure Payments",
    description: "Your transactions are protected with bank-level encryption and security.",
    color: "var(--green)",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description: "Our dedicated support team is available round the clock to assist you.",
    color: "var(--red)",
  },
  {
    icon: FaPercent,
    title: "Exclusive Offers",
    description: "Get access to special discounts and exclusive deals on movie tickets.",
    color: "var(--yellow)",
  },
  {
    icon: FaClock,
    title: "Real-time Updates",
    description: "Get instant notifications about show changes and booking confirmations.",
    color: "var(--indigo)",
  },
];

function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          >
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            The Best Movie Experience
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            We provide everything you need for a seamless movie booking experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${feature.color}15` }}
              >
                <feature.icon className="text-2xl" style={{ color: feature.color }} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
