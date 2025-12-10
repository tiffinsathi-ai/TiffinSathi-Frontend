import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Settings,
  LogOut,
  UserCircle,
  Shield,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminApi from "../../helpers/adminApi";
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

const AdminNavbar = ({ onToggleSidebar, isMobile }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data from database
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      console.log("Fetching user data...");
      
      // Try multiple endpoints to get user data
      let userData;
      
      try {
        // First try the current user profile endpoint
        userData = await AdminApi.getCurrentUserProfile();
        console.log("User data from profile endpoint:", userData);
      } catch (profileError) {
        console.log("Profile endpoint failed, trying users list...");
        
        // If profile endpoint fails, try to get the current user from the users list
        const allUsers = await AdminApi.getUsers();
        const userEmail = localStorage.getItem("userEmail") || JSON.parse(localStorage.getItem("user") || "{}").email;
        
        if (userEmail) {
          userData = allUsers.find(u => u.email === userEmail);
          console.log("Found user in users list:", userData);
        }
        
        if (!userData) {
          // Fallback: create a mock admin user from token data
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            userData = JSON.parse(storedUser);
          } else {
            userData = {
              userName: "Admin User",
              email: userEmail || "admin@tiffinsathi.com",
              role: "ADMIN"
            };
          }
        }
      }

      if (userData) {
        setUser(userData);
        
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
        } else {
          setProfilePicture(null);
        }
        
        // Store in localStorage for quick access
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User data set successfully:", userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to localStorage if API fails
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setProfilePicture(parsedUser.profilePicture || null);
          console.log("Using stored user data:", parsedUser);
        } catch (parseError) {
          console.error("Error parsing stored user data:", parseError);
          // Create default admin user
          setUser({
            userName: "Admin User",
            email: "admin@tiffinsathi.com",
            role: "ADMIN"
          });
        }
      } else {
        // Create default admin user
        setUser({
          userName: "Admin User",
          email: "admin@tiffinsathi.com",
          role: "ADMIN"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Set up interval to refresh user data periodically
    const interval = setInterval(fetchUserData, 300000); // Refresh every 5 minutes

    // Listen for user data updates from profile page
    const handleUserDataUpdated = (event) => {
      console.log("User data updated event received:", event.detail);
      if (event.detail) {
        setUser(event.detail);
        setProfilePicture(event.detail.profilePicture || null);
        localStorage.setItem("user", JSON.stringify(event.detail));
      }
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (!user) return "Admin";
    
    return user.userName || 
           user.name || 
           user.username || 
           "Admin User";
  };

  const getUserEmail = () => {
    if (!user) return "admin@tiffinsathi.com";
    return user.email || user.businessEmail || "admin@tiffinsathi.com";
  };

  const getProfilePictureSrc = () => {
    if (profilePicture) {
      if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
        return profilePicture;
      }
      if (typeof profilePicture === 'string') {
        // If it's a base64 string without data URL prefix
        if (profilePicture.startsWith('/9j/') || profilePicture.length > 1000) {
          return `data:image/jpeg;base64,${profilePicture}`;
        }
        return profilePicture;
      }
    }
    return defaultUser;
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/admin/profile");
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/admin/settings");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    setUser(null);
    setProfilePicture(null);
    setIsDropdownOpen(false);
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <nav
        style={{
          backgroundColor: designTokens.colors.background.primary,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Tiffin Sathi Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <h1
                  className="text-xl sm:text-2xl font-bold hidden sm:block"
                  style={{
                    fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                    color: designTokens.colors.secondary.main,
                  }}
                >
                  Tiffin Sathi
                </h1>
              </div>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded hidden sm:block"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      style={{
        backgroundColor: designTokens.colors.background.primary,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Tiffin Sathi Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <h1
                className="text-xl sm:text-2xl font-bold hidden sm:block"
                style={{
                  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                  color: designTokens.colors.secondary.main,
                }}
              >
                Tiffin Sathi
              </h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              className="relative p-2 rounded-lg transition-all duration-200"
              style={{ color: designTokens.colors.text.primary }}
              onMouseEnter={() => setHoveredItem("bell")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Bell size={20} className="sm:w-6 sm:h-6" />
              <span
                className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white text-[10px] sm:text-xs"
                style={{ backgroundColor: designTokens.colors.accent.red }}
              >
                5
              </span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200"
                style={{ color: designTokens.colors.text.primary }}
                onMouseEnter={() => setHoveredItem("profile")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-white bg-gray-200">
                  <img
                    src={getProfilePictureSrc()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("Image load error, using default");
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
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  } hidden sm:inline`}
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
                  className="absolute right-0 mt-2 w-64 sm:w-72 rounded-lg shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: designTokens.colors.background.primary,
                    border: `1px solid ${designTokens.colors.border.light}`,
                  }}
                >
                  {/* User Info Section - Centered */}
                  <div
                    className="px-4 py-4 border-b"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <div className="flex flex-col items-center text-center mb-2">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 bg-gray-200 mb-3">
                        <img
                          src={getProfilePictureSrc()}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultUser;
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <p
                          className="text-sm font-semibold truncate mb-1"
                          style={{ color: designTokens.colors.text.primary }}
                        >
                          {getDisplayName()}
                        </p>
                        <p
                          className="text-xs truncate mb-2"
                          style={{ color: designTokens.colors.text.secondary }}
                        >
                          {getUserEmail()}
                        </p>
                        {/* Centered Administrator role */}
                        <div className="flex items-center justify-center gap-1.5">
                          <Shield size={12} className="text-blue-500" />
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            Administrator
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items - Left Aligned (as in original) */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <UserCircle size={18} />
                      <span className="text-sm">My Profile</span>
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <Settings size={18} />
                      <span className="text-sm">Admin Settings</span>
                    </button>
                  </div>

                  <div
                    className="border-t"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-red-50"
                      style={{ color: designTokens.colors.accent.red }}
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

export default AdminNavbar;