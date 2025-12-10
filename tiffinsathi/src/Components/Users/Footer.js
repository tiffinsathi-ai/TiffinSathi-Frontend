import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {/* Left Column: Company Information */}
        <div className="flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <img
              src={logo}
              alt="Tiffin Sathi Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain"
            />
            <h1
              className="text-xl sm:text-2xl lg:text-3xl font-bold"
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                color: "#F5B800",
              }}
            >
              Tiffin Sathi
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 leading-relaxed max-w-md">
            Bringing the authentic taste of home-cooked meals to your
            doorstep. Fresh, healthy, and made with love.
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-3 sm:gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>

        {/* Middle Column: Quick Links */}
        <div>
          <h2 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h2>
          <ul className="space-y-2 sm:space-y-3">
            <li>
              <Link
                to="/about"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/packages"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Our Packages
              </Link>
            </li>
            <li>
              <Link
                to="/how-it-works"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Column: Contact Info */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Info</h2>
          <ul className="space-y-2 sm:space-y-3">
            <li className="flex items-start gap-3">
              <HiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 flex-shrink-0" />
              <a
                href="tel:+9779800000000"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base break-words"
              >
                +977 98XXXXXXXX
              </a>
            </li>
            <li className="flex items-start gap-3">
              <HiMail className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 flex-shrink-0" />
              <a
                href="mailto:hello@tiffinsathi.com"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base break-words"
              >
                hello@tiffinsathi.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <HiLocationMarker className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 flex-shrink-0" />
              <span className="text-gray-400 text-sm sm:text-base">Kathmandu, Nepal</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-800 text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} Tiffin Sathi. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;