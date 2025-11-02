import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column: Company Information */}
        <div className="flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-4">
            <img
              src={logo}
              alt="Tiffin Sathi Logo"
              className="w-14 h-14 object-contain"
            />
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                color: "#F5B800",
              }}
            >
              Tiffin Sathi
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Bringing the authentic taste of home-cooked meals to your
            doorstep. Fresh, healthy, and made with love.
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a
              href="#"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Middle Column: Quick Links */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Our Packages
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Right Column: Contact Info */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Contact Info</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <HiPhone className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <span className="text-gray-400">+977 98XXXXXXXX</span>
            </li>
            <li className="flex items-start gap-3">
              <HiMail className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <span className="text-gray-400">hello@tiffinsathi.com</span>
            </li>
            <li className="flex items-start gap-3">
              <HiLocationMarker className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <span className="text-gray-400">Kathmandu, Nepal</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

