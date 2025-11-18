import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiCube,
  HiCalendar,
  HiUser,
  HiChevronDown,
} from "react-icons/hi";
import { UtensilsCrossed, LogOut, Settings } from "lucide-react";
import logo from "../../assets/logo.png";
import defaultUser from "../../assets/default-user.jpg";

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const checkAuthStatus = () => {
    // Check for token in localStorage (primary authentication check)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const username = localStorage.getItem("username");

    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Check for profile picture in user data
          if (parsedUser.profilePicture) {
            setProfilePicture(parsedUser.profilePicture);
          } else {
            setProfilePicture(null);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          // If user data is invalid, still authenticated but no user info
          setUser({ 
            userName: username || "User", 
            email: localStorage.getItem("userEmail") || "",
            username: username || "User"
          });
          setProfilePicture(null);
        }
      } else {
        // Token exists but no user data, set default user
        setUser({ 
          userName: username || "User", 
          email: localStorage.getItem("userEmail") || "",
          username: username || "User"
        });
        setProfilePicture(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setProfilePicture(null);
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
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUser(null);
    setProfilePicture(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Get display name with fallbacks
  const getDisplayName = () => {
    if (!user) return "User";
    
    return user.username || 
           user.userName || 
           user.name || 
           user.ownerName || 
           user.businessName || 
           "User";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return "";
    return user.email || localStorage.getItem("userEmail") || "";
  };

  // Format base64 image data for display
  const getProfilePictureSrc = () => {
    if (profilePicture) {
      // Check if it's already a base64 data URL
      if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
        return profilePicture;
      }
      // If it's a base64 string without data URL prefix
      if (typeof profilePicture === 'string') {
        return `data:image/jpeg;base64,${profilePicture}`;
      }
      // If it's a byte array
      if (Array.isArray(profilePicture)) {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(profilePicture)));
        return `data:image/jpeg;base64,${base64}`;
      }
    }
    return defaultUser;
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
    <header className="relative bg-white px-8 py-3 flex items-center justify-between border-b border-gray-200">
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
        {/* Home - Active */}
        <button
          className="text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium shadow-sm transition-colors"
          style={{ backgroundColor: "#F5B800" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e0a500")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#F5B800")
          }
        >
          <HiHome className="w-4 h-4 text-white" />
          <span>Home</span>
        </button>

        {/* Packages - Inactive */}
        <button className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <HiCube className="w-4 h-4" />
          <span>Packages</span>
        </button>

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
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none hover:opacity-80 transition-opacity"
          >
            {/* Profile Picture or Default */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200">
              <img
                src={getProfilePictureSrc()}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultUser;
                }}
              />
            </div>

            {/* User Name and Chevron */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                {getDisplayName()}
              </span>
              <HiChevronDown className="w-4 h-4 text-gray-800" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
              style={{ top: "100%" }}
            >
              {/* Header Section with User Info */}
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  {/* Profile Picture in Dropdown */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200">
                    <img
                      src={getProfilePictureSrc()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = defaultUser;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-gray-900 truncate">
                      {getDisplayName()}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {getUserEmail()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {/* My Profile */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to profile page
                    // navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <HiUser className="w-5 h-5 text-gray-700" />
                  <span>My Profile</span>
                </button>

                {/* Settings (Optional) */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to settings page
                    // navigate("/settings");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <Settings className="w-5 h-5 text-gray-700" />
                  <span>Settings</span>
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