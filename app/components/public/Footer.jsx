"use client";

import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaTicketAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    movies: [
      { label: "Now Showing", href: "#shows" },
      { label: "Coming Soon", href: "#" },
      { label: "Cinemas", href: "#" },
      { label: "Offers", href: "#" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="relative" style={{ background: "var(--card)" }}>
      {/* Top Wave */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "var(--gradient-primary)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <FaTicketAlt className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                CinemaBook
              </span>
            </div>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              Your ultimate destination for movie ticket booking. Experience cinema like never before with premium seats and exclusive offers.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                <FaMapMarkerAlt className="flex-shrink-0" style={{ color: "var(--blue)" }} />
                <span>123 Cinema Street, Movie City</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                <FaPhone className="flex-shrink-0" style={{ color: "var(--green)" }} />
                <span>+1 234 567 8900</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                <FaEnvelope className="flex-shrink-0" style={{ color: "var(--purple)" }} />
                <span>support@cinemabook.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: "var(--foreground)" }}>Movies</h4>
            <ul className="space-y-3">
              {footerLinks.movies.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: "var(--foreground)", opacity: 0.7 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: "var(--foreground)" }}>Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: "var(--foreground)", opacity: 0.7 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: "var(--foreground)" }}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: "var(--foreground)", opacity: 0.7 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12" style={{ borderTop: "1px solid var(--card-border)" }} />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-sm text-center md:text-left" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            {currentYear} CinemaBook. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <social.icon className="text-lg" style={{ color: "var(--foreground)", opacity: 0.7 }} />
              </a>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Payment Methods:</span>
            <div className="flex gap-2">
              {["Visa", "MC", "Amex"].map((pm) => (
                <div
                  key={pm}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)", opacity: 0.7 }}
                >
                  {pm}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
