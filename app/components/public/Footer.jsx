"use client";

import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaChevronRight,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    movies: [
      { label: "Now Showing", href: "/public/shows?filter=NOW_SHOWING" },
      { label: "Coming Soon", href: "/public/shows?filter=COMING_SOON" },
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
      { label: "Contact", href: "#" },
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
      {/* Gold Top Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #d4af37, #f4d03f, #d4af37)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/logo.png"
                alt="Anant Vijay Auditorium Logo"
                className="w-11 h-11 rounded-xl object-cover shrink-0"
                style={{ background: "linear-gradient(135deg, #d4af37, #b8860b)" }}
              />
              <div>
                <span 
                  className="text-xl font-bold block"
                  style={{ 
                    color: "var(--foreground)",
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  Anant Vijay
                </span>
                <span 
                  className="text-xs tracking-[0.15em] uppercase block"
                  style={{ color: "#d4af37" }}
                >
                  Auditorium
                </span>
              </div>
            </div>
            <p 
              className="text-sm mb-6 leading-relaxed"
              style={{ color: "var(--foreground)", opacity: 0.6 }}
            >
              Your premier destination for an exceptional cinema experience. 
              Premium comfort, world-class entertainment, unforgettable memories.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <div 
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--foreground)", opacity: 0.6 }}
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(212,175,55,0.1)" }}
                >
                  <FaMapMarkerAlt className="text-[#d4af37]" size={12} />
                </div>
                <span>Anant Vijay Auditorium, Main Road</span>
              </div>
              <div 
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--foreground)", opacity: 0.6 }}
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(212,175,55,0.1)" }}
                >
                  <FaPhone className="text-[#d4af37]" size={12} />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div 
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--foreground)", opacity: 0.6 }}
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(212,175,55,0.1)" }}
                >
                  <FaEnvelope className="text-[#d4af37]" size={12} />
                </div>
                <span>booking@anantvijay.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 
              className="text-sm font-bold mb-6 tracking-wider uppercase"
              style={{ color: "var(--foreground)" }}
            >
              Movies
            </h4>
            <ul className="space-y-3">
              {footerLinks.movies.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm flex items-center gap-2 transition-all duration-200 hover:text-[#d4af37] group"
                    style={{ color: "var(--foreground)", opacity: 0.6 }}
                  >
                    <FaChevronRight 
                      size={10} 
                      className="text-[#d4af37] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 
              className="text-sm font-bold mb-6 tracking-wider uppercase"
              style={{ color: "var(--foreground)" }}
            >
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm flex items-center gap-2 transition-all duration-200 hover:text-[#d4af37] group"
                    style={{ color: "var(--foreground)", opacity: 0.6 }}
                  >
                    <FaChevronRight 
                      size={10} 
                      className="text-[#d4af37] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 
              className="text-sm font-bold mb-6 tracking-wider uppercase"
              style={{ color: "var(--foreground)" }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm flex items-center gap-2 transition-all duration-200 hover:text-[#d4af37] group"
                    style={{ color: "var(--foreground)", opacity: 0.6 }}
                  >
                    <FaChevronRight 
                      size={10} 
                      className="text-[#d4af37] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gold Divider */}
        <div 
          className="my-12 h-px"
          style={{ 
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" 
          }}
        />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p 
            className="text-xs text-center md:text-left tracking-wide"
            style={{ color: "var(--foreground)", opacity: 0.4 }}
          >
            © {currentYear} Anant Vijay Auditorium. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ 
                  background: "rgba(212,175,55,0.08)",
                  border: "1px solid rgba(212,175,55,0.2)"
                }}
              >
                <social.icon 
                  className="text-sm transition-colors duration-200" 
                  style={{ color: "#d4af37" }}
                />
              </a>
            ))}
          </div>

          {/* Design & Develop Credit */}
          <div className="flex items-center gap-2">
            <span 
              className="text-xs tracking-wide"
              style={{ color: "var(--foreground)", opacity: 0.4 }}
            >
              Design & Develop by
            </span>
            <a
              href="https://www.globalinfotechindia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold hover:text-[#d4af37] transition-colors duration-200"
              style={{ color: "#d4af37" }}
            >
              Global Info Tech India
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
