import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Settings,
  LogOut,
  UserCircle,
  CreditCard,
} from "lucide-react";
import logo from "../../assets/logo.png";
import defaultUser from "../../assets/default-user.jpg";

const designTokens = {
  colors: {
    secondary: {
      main: "#6DB33F",
      hover: "#5FA535",
    },
    accent: {
      red: "#D94826",
    },
    background: {
      primary: "#FFFFFF",
    },
    text: {
      primary: "#212529",
      secondary: "#6C757D",
    },
    border: {
      light: "#E9ECEF",
    },
  },
};

const VendorNavbar = ({ onToggleSidebar }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const dropdownRef = useRef(null);

  // Check authentication and user data
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const username = localStorage.getItem("username");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.profilePicture) {
          setProfilePicture(parsedUser.profilePicture);
        } else {
          setProfilePicture(null);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser({ 
          userName: username || "Vendor", 
          email: localStorage.getItem("userEmail") || "",
          username: username || "Vendor"
        });
        setProfilePicture(null);
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuthStatus);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get display name with fallbacks
  const getDisplayName = () => {
    if (!user) return "Vendor";
    
    return user.username || 
           user.userName || 
           user.name || 
           user.ownerName || 
           user.businessName || 
           "Vendor";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return "";
    return user.email || localStorage.getItem("userEmail") || "";
  };

  // Format base64 image data for display
  const getProfilePictureSrc = () => {
    if (profilePicture) {
      if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
        return profilePicture;
      }
      if (typeof profilePicture === 'string') {
        return `data:image/jpeg;base64,${profilePicture}`;
      }
      if (Array.isArray(profilePicture)) {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(profilePicture)));
        return `data:image/jpeg;base64,${base64}`;
      }
    }
    return defaultUser;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    setUser(null);
    setProfilePicture(null);
    setIsDropdownOpen(false);
    window.location.href = "/login";
  };

  return (
    <nav
      style={{
        backgroundColor: designTokens.colors.background.primary,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Tiffin Sathi Logo"
              className="w-10 h-10 object-contain"
            />
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                color: designTokens.colors.secondary.main,
              }}
            >
              Tiffin Sathi
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button
              className="relative p-2 rounded-lg transition-all duration-200"
              style={{ color: designTokens.colors.text.primary }}
              onMouseEnter={() => setHoveredItem("bell")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Bell size={24} />
              <span
                className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white"
                style={{ backgroundColor: designTokens.colors.accent.red }}
              >
                3
              </span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200"
                style={{ color: designTokens.colors.text.primary }}
                onMouseEnter={() => setHoveredItem("profile")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                  <img
                    src={getProfilePictureSrc()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultUser;
                    }}
                  />
                </div>
                <span
                  className="text-sm font-medium hidden sm:inline"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  {getDisplayName()}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg overflow-hidden"
                  style={{
                    backgroundColor: designTokens.colors.background.primary,
                    border: `1px solid ${designTokens.colors.border.light}`,
                  }}
                >
                  {/* User Info Section */}
                  <div
                    className="px-4 py-4 border-b"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
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
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: designTokens.colors.text.primary }}
                        >
                          {getDisplayName()}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: designTokens.colors.text.secondary }}
                        >
                          {getUserEmail()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <a
                      href="#profile"
                      className="flex items-center gap-3 px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.text.primary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#F8F9FA")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <UserCircle size={18} />
                      <span className="text-sm">My Profile</span>
                    </a>

                    <a
                      href="#settings"
                      className="flex items-center gap-3 px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.text.primary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#F8F9FA")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <Settings size={18} />
                      <span className="text-sm">Settings</span>
                    </a>

                    <a
                      href="#billing"
                      className="flex items-center gap-3 px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.text.primary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#F8F9FA")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <CreditCard size={18} />
                      <span className="text-sm">Billing</span>
                    </a>
                  </div>

                  <div
                    className="border-t"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 transition-colors"
                      style={{ color: designTokens.colors.accent.red }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#FEF2F2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavbar;