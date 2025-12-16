import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HiHome,
  HiCube,
  HiCalendar,
  HiUser,
  HiChevronDown,
} from "react-icons/hi";
import { UtensilsCrossed, LogOut } from "lucide-react";
import logo from "../../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const checkAuthStatus = () => {
    // Check for token in localStorage (primary authentication check)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          // If user data is invalid, still authenticated but no user info
          setUser({ userName: "User" });
        }
      } else {
        // Token exists but no user data, set default user
        setUser({ userName: "User" });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is authenticated on mount
    checkAuthStatus();

    // Listen for storage changes (when login happens in another tab or after navigation)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check on focus (when user comes back to the tab)
    window.addEventListener("focus", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("rememberedEmail");
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".profile-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="relative bg-white px-8 py-3 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        {/* Logo Image */}
        <img
          src={logo}
          alt="Tiffin Sathi Logo"
          className="w-12 h-12 object-contain"
        />
        <h1
          className="text-xl font-bold"
          style={{
            fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
            color: "#4A8C39",
          }}
        >
          Tiffin Sathi
        </h1>
      </div>

      {/* Navigation Links - Centered */}
      <nav className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
        {/* Home */}
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors ${
            location.pathname === "/"
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
          style={
            location.pathname === "/" ? { backgroundColor: "#F5B800" } : {}
          }
          onMouseEnter={(e) => {
            if (location.pathname !== "/") {
              e.currentTarget.style.color = "#1f2937";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/") {
              e.currentTarget.style.color = "#4b5563";
            }
          }}
        >
          <HiHome className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {/* Packages */}
        <Link
          to="/packages"
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors ${
            location.pathname === "/packages"
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
          style={
            location.pathname === "/packages"
              ? { backgroundColor: "#F5B800" }
              : {}
          }
          onMouseEnter={(e) => {
            if (location.pathname !== "/packages") {
              e.currentTarget.style.color = "#1f2937";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/packages") {
              e.currentTarget.style.color = "#4b5563";
            }
          }}
        >
          <HiCube className="w-4 h-4" />
          <span>Packages</span>
        </Link>

        {/* Restaurant - Inactive */}
        <button className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <UtensilsCrossed className="w-4 h-4" style={{ color: "#212529" }} />
          <span>Restaurant</span>
        </button>

        {/* My Subscription - Inactive */}
        <button className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <HiCalendar className="w-4 h-4" />
          <span>My Subscription</span>
        </button>
      </nav>

      {/* Login Button or Profile Dropdown */}
      {isAuthenticated && user ? (
        <div className="relative profile-dropdown">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none hover:opacity-80 transition-opacity"
          >
            {/* Yellow Circular Icon with White Person Silhouette */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F5B800" }}
            >
              <HiUser className="w-6 h-6 text-white" />
            </div>

            {/* User Name */}
            <span className="text-sm font-medium text-gray-800">
              {user.userName || user.name || user.email || "User"}
            </span>

            {/* Dropdown Chevron */}
            <HiChevronDown className="w-4 h-4 text-gray-800" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
              style={{ top: "100%" }}
            >
              {/* Header Section with User Name and Email */}
              <div className="px-4 py-3 text-center border-b border-gray-200">
                <div className="font-bold text-base text-gray-900 mb-1">
                  {user.userName || user.name || "User"}
                </div>
                <div className="text-sm text-gray-600">{user.email || ""}</div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {/* My Profile */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to profile page (you can create this later)
                    // navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <HiUser className="w-5 h-5 text-gray-700" />
                  <span>My Profile</span>
                </button>

                {/* Separator */}
                <div className="border-t border-gray-200 my-1"></div>

                {/* Logout - Red */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/login"
          className="text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors inline-block"
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
      )}
    </header>
  );
};

export default Header;
