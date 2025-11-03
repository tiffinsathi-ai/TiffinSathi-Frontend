import React from "react";
import { Link } from "react-router-dom";
import { HiHome, HiCube, HiCalendar, HiUser } from "react-icons/hi";
import logo from "../../assets/logo.png";

const Header = () => {
  return (
    <header className="relative bg-white px-8 py-1 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        {/* Logo Image */}
        <img
          src={logo}
          alt="Tiffin Sathi Logo"
          className="w-24 h-24 object-contain"
        />
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
            color: "#4A8C39",
          }}
        >
          Tiffin Sathi
        </h1>
      </div>

      {/* Navigation Links - Centered */}
      <nav className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
        {/* Home - Active */}
        <button
          className="text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
          style={{ backgroundColor: "#F5B800" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e0a500")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#F5B800")
          }
        >
          <HiHome className="w-5 h-5 text-white" />
          <span>Home</span>
        </button>

        {/* Packages - Inactive */}
        <button className="px-5 py-2.5 flex items-center gap-2 font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <HiCube className="w-5 h-5" />
          <span>Packages</span>
        </button>

        {/* Subscription - Inactive */}
        <button className="px-5 py-2.5 flex items-center gap-2 font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <HiCalendar className="w-5 h-5" />
          <span>Subscription</span>
        </button>

        {/* Profile - Inactive */}
        <button className="px-5 py-2.5 flex items-center gap-2 font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <HiUser className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Login Button */}
      <Link
        to="/login"
        className="text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors inline-block"
        style={{ backgroundColor: "#F5B800" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#e0a500")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#F5B800")
        }
      >
        <span>Login</span>
      </Link>
    </header>
  );
};

export default Header;