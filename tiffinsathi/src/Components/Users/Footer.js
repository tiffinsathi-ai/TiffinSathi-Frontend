import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column: Company Information */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Tiffin Sathi Logo" className="w-14 h-14 object-contain" />
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

          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Bringing the authentic taste of home-cooked meals to your doorstep. Fresh,
            healthy, and made with love.
          </p>

          <div className="flex gap-4">
            <button
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-5 h-5" />
            </button>
            <button
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-5 h-5" />
            </button>
            <button
              className="text-white hover:text-gray-400 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle Column */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-3">
            <li><button className="text-gray-400 hover:text-white transition-colors">About Us</button></li>
            <li><button className="text-gray-400 hover:text-white transition-colors">Our Packages</button></li>
            <li><button className="text-gray-400 hover:text-white transition-colors">How It Works</button></li>
            <li><button className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
          </ul>
        </div>

        {/* Right Column */}
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