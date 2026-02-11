// src/Components/Vendor/VendorNavbar.js
import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Settings,
  LogOut,
  UserCircle,
  Menu,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vendorApi } from "../../helpers/api";
import logo from "../../assets/logo.png";
import defaultUser from "../../assets/default-user.jpg";

const designTokens = {
  colors: {
    secondary: {
      main: "#16A34A",
      hover: "#15803D",
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
    },
  },
};

const VendorNavbar = ({ onToggleSidebar, isMobile }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch vendor data from database
  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor profile using the provided API
      console.log("Fetching vendor data...");
      const response = await vendorApi.getVendorProfile();
      
      if (response.ok && response.data) {
        console.log("Vendor data from API:", response.data);
        setVendor(response.data);
        
        if (response.data.profilePicture || response.data.businessImage) {
          setProfilePicture(response.data.profilePicture || response.data.businessImage);
        } else {
          setProfilePicture(null);
        }
        
        // Store in localStorage for quick access
        localStorage.setItem("vendor", JSON.stringify(response.data));
        
        // Update auth storage with vendor data
        if (response.data.businessName) {
          localStorage.setItem("businessName", response.data.businessName);
        }
        if (response.data.vendorId || response.data.id) {
          localStorage.setItem("vendorId", response.data.vendorId || response.data.id);
        }
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      // Fallback to localStorage if API fails
      const storedVendor = localStorage.getItem("vendor");
      if (storedVendor) {
        try {
          const parsedVendor = JSON.parse(storedVendor);
          setVendor(parsedVendor);
          setProfilePicture(parsedVendor.profilePicture || parsedVendor.businessImage || null);
          console.log("Using stored vendor data:", parsedVendor);
        } catch (parseError) {
          console.error("Error parsing stored vendor data:", parseError);
          // Create default vendor
          setVendor({
            businessName: "Vendor Business",
            ownerName: "Vendor Owner",
            businessEmail: "vendor@tiffinsathi.com",
            status: "APPROVED"
          });
        }
      } else {
        // Create default vendor
        setVendor({
          businessName: "Vendor Business",
          ownerName: "Vendor Owner",
          businessEmail: "vendor@tiffinsathi.com",
          status: "APPROVED"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications (static for now)
  const fetchNotifications = async () => {
    // This can be replaced with real API call when available
    const mockNotifications = [
      { id: 1, message: "New order received from John Doe", time: "10 min ago", read: false, type: "order" },
      { id: 2, message: "Subscription #SUB123 is about to expire", time: "1 hour ago", read: false, type: "subscription" },
      { id: 3, message: "Delivery partner assigned to order #456", time: "2 hours ago", read: true, type: "delivery" },
      { id: 4, message: "Payment received for order #789", time: "3 hours ago", read: true, type: "payment" },
    ];
    setNotifications(mockNotifications);
  };

  useEffect(() => {
    fetchVendorData();
    fetchNotifications();
    
    // Set up interval to refresh vendor data periodically
    const interval = setInterval(fetchVendorData, 300000); // Refresh every 5 minutes

    // Listen for vendor data updates from profile page
    const handleVendorDataUpdated = (event) => {
      console.log("Vendor data updated event received:", event.detail);
      if (event.detail) {
        setVendor(event.detail);
        setProfilePicture(event.detail.profilePicture || event.detail.businessImage || null);
        localStorage.setItem("vendor", JSON.stringify(event.detail));
      }
    };

    window.addEventListener('vendorDataUpdated', handleVendorDataUpdated);

    return () => {
      clearInterval(interval);
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

  const getVendorStatus = () => {
    if (!vendor) return "PENDING";
    return vendor.status || "PENDING";
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/vendor/profile");
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/vendor/settings");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vendor");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("businessName");
    localStorage.removeItem("vendorId");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("vendor");
    
    setVendor(null);
    setProfilePicture(null);
    setIsDropdownOpen(false);
    window.location.href = "/login";
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                <div className="hidden sm:block">
                  <h1
                    className="text-xl sm:text-2xl font-bold leading-tight"
                    style={{
                      fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                      color: designTokens.colors.secondary.main,
                    }}
                  >
                    Tiffin Sathi
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Vendor Portal</p>
                </div>
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
              <div className="hidden sm:block">
                <h1
                  className="text-xl sm:text-2xl font-bold leading-tight"
                  style={{
                    fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                    color: designTokens.colors.secondary.main,
                  }}
                >
                  Tiffin Sathi
                </h1>
                <p className="text-xs text-gray-500 font-medium">Vendor Portal</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg transition-all duration-200"
                style={{ color: designTokens.colors.text.primary }}
                onMouseEnter={() => setHoveredItem("bell")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Bell size={20} className="sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white text-[10px] sm:text-xs"
                    style={{ backgroundColor: designTokens.colors.accent.red }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <button 
                        onClick={clearAllNotifications} 
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <button 
                              onClick={() => markNotificationAsRead(notification.id)} 
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
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
                  {/* Vendor Info Section - Centered */}
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
                          {getVendorEmail()}
                        </p>
                        {/* Centered Vendor status */}
                        <div className="flex items-center justify-center gap-1.5">
                          <Store size={12} className="text-green-500" />
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            getVendorStatus() === "APPROVED" || getVendorStatus() === "ACTIVE"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : getVendorStatus() === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {getVendorStatus() === "APPROVED" || getVendorStatus() === "ACTIVE" 
                              ? "Approved Vendor" 
                              : getVendorStatus()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items - Left Aligned */}
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
                      <span className="text-sm">Settings</span>
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

export default VendorNavbar;