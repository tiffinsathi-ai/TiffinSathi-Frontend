import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Settings,
  LogOut,
  UserCircle,
  Menu,
  Store,
  Shield,
  Mail,
  Phone,
  Home
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { vendorApi } from "../../helpers/api";
import authStorage from "../../helpers/authStorage";
import logo from "../../assets/logo.png";
import defaultUser from "../../assets/default-user.jpg";

const designTokens = {
  colors: {
    secondary: {
      main: "#16A34A",
      hover: "#15803D",
      light: "#DCFCE7"
    },
    accent: {
      red: "#DC2626",
      orange: "#F97316",
      blue: "#3B82F6"
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F8FAFC"
    },
    text: {
      primary: "#1E293B",
      secondary: "#475569",
      tertiary: "#64748B",
      inverse: "#FFFFFF"
    },
    accent: {
      red: "#DC2626",
    },
    background: {
      primary: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#475569",
      tertiary: "#64748B",
    },
    border: {
      light: "#E2E8F0",
      medium: "#CBD5E1"
    },
    status: {
      active: "#16A34A",
      pending: "#F59E0B",
      rejected: "#EF4444",
      suspended: "#6B7280"
    }
  }
};

const VendorNavbar = ({ onToggleSidebar, isMobile }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch vendor data from database
  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      // Check token first
      const token = authStorage.getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch vendor profile
      const response = await vendorApi.getVendorProfile();
      
      if (response.ok && response.data) {
        setVendor(response.data);
        
        if (response.data.profilePicture || response.data.businessImage) {
          setProfilePicture(response.data.profilePicture || response.data.businessImage);
        } else {
          setProfilePicture(null);
        }
        
        // Store in localStorage for quick access
        authStorage.setUser(response.data);
        
        // Update auth storage with vendor data
        if (response.data.businessName) {
          localStorage.setItem("businessName", response.data.businessName);
        }
        if (response.data.vendorId || response.data.id) {
          localStorage.setItem("vendorId", response.data.vendorId || response.data.id);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        handleLogout("Session expired. Please login again.");
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      
      // Fallback to localStorage if API fails
      const storedVendor = authStorage.getVendor();
      if (storedVendor) {
        setVendor(storedVendor);
        setProfilePicture(storedVendor.profilePicture || storedVendor.businessImage || null);
      } else {
        setVendor({
          businessName: "Vendor Business",
          ownerName: "Vendor Owner",
          businessEmail: "vendor@tiffinsathi.com",
          status: "APPROVED",
          phone: "+977 9800000000"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications count only
  const fetchNotifications = async () => {
    try {
      const response = await vendorApi.getNotifications();
      if (response.ok && response.data) {
        const unreadCount = response.data.filter(n => !n.read).length;
        setNotificationsCount(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchVendorData();
    fetchNotifications();
    
    // Set up interval to refresh notifications
    const notificationInterval = setInterval(fetchNotifications, 30000);

    // Listen for vendor data updates
    const handleVendorDataUpdated = (event) => {
      if (event.detail) {
        setVendor(event.detail);
        setProfilePicture(event.detail.profilePicture || event.detail.businessImage || null);
        authStorage.setVendor(event.detail);
      }
    };

    window.addEventListener('vendorDataUpdated', handleVendorDataUpdated);

    return () => {
      clearInterval(notificationInterval);
      window.removeEventListener('vendorDataUpdated', handleVendorDataUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (!vendor) return "Vendor";
    
    return vendor.businessName || vendor.ownerName || "Vendor";
  };

  const getVendorEmail = () => {
    if (!vendor) return "vendor@tiffinsathi.com";
    return vendor.businessEmail || vendor.email || "vendor@tiffinsathi.com";
  };

  const getVendorPhone = () => {
    if (!vendor) return "+977 9800000000";
    return vendor.phone || vendor.businessPhone || "+977 9800000000";
  };

  const getProfilePictureSrc = () => {
    if (profilePicture) {
      if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
        return profilePicture;
      }
      if (typeof profilePicture === 'string') {
        if (profilePicture.startsWith('/9j/') || profilePicture.length > 1000) {
          return `data:image/jpeg;base64,${profilePicture}`;
        }
        return profilePicture;
      }
    }
    return defaultUser;
  };

  const getVendorStatus = () => {
    if (!vendor) return "PENDING";
    const status = vendor.status || "PENDING";
    return status.toUpperCase();
  };

  const getStatusColor = (status) => {
    const statusUpper = status.toUpperCase();
    switch(statusUpper) {
      case "ACTIVE":
      case "APPROVED":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          icon: "bg-green-500"
        };
      case "PENDING":
      case "REVIEW":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
          icon: "bg-yellow-500"
        };
      case "SUSPENDED":
      case "BLOCKED":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          icon: "bg-red-500"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: "bg-gray-500"
        };
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/vendor/profile");
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/vendor/settings");
  };

  const handleLogout = (message = "Logged out successfully") => {
    authStorage.clearAuth();
    
    // Redirect to login with message
    navigate("/login", { 
      state: { 
        message,
        redirectTo: "/vendor/dashboard"
      },
      replace: true 
    });
  };

  if (loading) {
    return (
      <nav
        style={{
          backgroundColor: designTokens.colors.background.primary,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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
              style={{
                border: `1px solid ${designTokens.colors.border.light}`
              }}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Tiffin Sathi Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <div>
                <h1
                  className="text-xl sm:text-2xl font-bold hidden sm:block"
                  style={{
                    fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                    color: designTokens.colors.secondary.main,
                  }}
                >
                  Tiffin Sathi
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Vendor Portal</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notifications - SIMPLIFIED */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                style={{ 
                  color: designTokens.colors.text.primary,
                  border: `1px solid ${designTokens.colors.border.light}`
                }}
                onMouseEnter={() => setHoveredItem("bell")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Bell size={20} className="sm:w-6 sm:h-6" />
                {notificationsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white text-[10px] sm:text-xs"
                    style={{ backgroundColor: designTokens.colors.accent.red }}
                  >
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50"
                  style={{ borderColor: designTokens.colors.border.medium }}
                >
                  <div className="p-4 border-b">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-500">
                      {notificationsCount} unread {notificationsCount === 1 ? 'notification' : 'notifications'}
                    </p>
                  </div>
                  <div className="p-6 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Notifications will appear here</p>
                    <p className="text-sm text-gray-500 mt-1">You have {notificationsCount} unread</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                style={{ 
                  color: designTokens.colors.text.primary,
                  border: `1px solid ${designTokens.colors.border.light}`
                }}
                onMouseEnter={() => setHoveredItem("profile")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden border-2 border-white bg-gradient-to-br from-green-100 to-green-50">
                  <img
                    src={getProfilePictureSrc()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultUser;
                    }}
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <span
                    className="text-sm font-medium block"
                    style={{ color: designTokens.colors.text.primary }}
                  >
                    {getDisplayName()}
                  </span>
                  <span
                    className="text-xs block"
                    style={{ color: designTokens.colors.text.secondary }}
                  >
                    Vendor Account
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
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
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-lg shadow-xl overflow-hidden z-50"
                  style={{
                    backgroundColor: designTokens.colors.background.primary,
                    border: `1px solid ${designTokens.colors.border.medium}`,
                  }}
                >
                  {/* Vendor Info Section */}
                  <div
                    className="px-4 py-4 border-b bg-gradient-to-r from-green-50 to-gray-50"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-green-100 to-green-50">
                          <img
                            src={getProfilePictureSrc()}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = defaultUser;
                            }}
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(getVendorStatus()).icon}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className="text-sm font-bold mb-1 truncate"
                              style={{ color: designTokens.colors.text.primary }}
                            >
                              {getDisplayName()}
                            </p>
                            <div className="flex items-center gap-1 mb-1">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(getVendorStatus()).bg} ${getStatusColor(getVendorStatus()).text} ${getStatusColor(getVendorStatus()).border}`}>
                                <Store size={8} className="inline mr-1" />
                                {getVendorStatus()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/vendor/dashboard");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <Home size={16} className="text-green-600" />
                      <div>
                        <span className="text-sm font-medium">Dashboard</span>
                        <p className="text-xs text-gray-500">Back to dashboard</p>
                      </div>
                    </button>

                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <UserCircle size={16} className="text-green-600" />
                      <div>
                        <span className="text-sm font-medium">My Profile</span>
                        <p className="text-xs text-gray-500">View and edit profile</p>
                      </div>
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <Settings size={16} className="text-green-600" />
                      <div>
                        <span className="text-sm font-medium">Settings</span>
                        <p className="text-xs text-gray-500">Account settings</p>
                      </div>
                    </button>
                  </div>

                  <div
                    className="border-t"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <button
                      onClick={() => handleLogout()}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-red-50"
                      style={{ color: designTokens.colors.accent.red }}
                    >
                      <LogOut size={16} />
                      <div>
                        <span className="text-sm font-medium">Logout</span>
                        <p className="text-xs text-gray-500">Sign out of your account</p>
                      </div>
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