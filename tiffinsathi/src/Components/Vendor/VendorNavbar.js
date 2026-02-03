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
  const [notifications, setNotifications] = useState([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check token expiry periodically
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = authStorage.getToken();
      if (!token) {
        handleLogout();
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        
        if (Date.now() >= expiryTime - 60000) { // 1 minute before expiry
          console.log("Token expiring soon, redirecting to login...");
          handleLogout("Session expired. Please login again.");
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }
    };

    const interval = setInterval(checkTokenExpiry, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Check token on route change
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      navigate("/login", { 
        state: { 
          from: location.pathname,
          message: "Please login to continue"
        } 
      });
      return;
    }
  }, [location.pathname, navigate]);

  // Track user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    const inactivityCheck = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeSinceLastActivity > thirtyMinutes) {
        handleLogout("Logged out due to inactivity");
      }
    }, 60000); // Check every minute

    return () => clearInterval(inactivityCheck);
  }, [lastActivity]);

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

      // Fetch vendor profile using the provided API
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
        localStorage.setItem("lastVendorUpdate", Date.now().toString());
        
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
      if (error.response?.status === 401) {
        handleLogout("Session expired. Please login again.");
        return;
      }
      
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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await vendorApi.getNotifications();
      if (response.ok && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Mock notifications for demo
      const mockNotifications = [
        { id: 1, message: "New order #ORD-001 received from John Doe", time: "10 min ago", read: false, type: "order", priority: "high" },
        { id: 2, message: "Subscription #SUB-123 is about to expire tomorrow", time: "1 hour ago", read: false, type: "subscription", priority: "medium" },
        { id: 3, message: "Delivery partner assigned to order #456", time: "2 hours ago", read: true, type: "delivery", priority: "low" },
        { id: 4, message: "Payment of $150 received for order #789", time: "3 hours ago", read: true, type: "payment", priority: "low" },
        { id: 5, message: "New review received from Sarah Johnson", time: "5 hours ago", read: false, type: "review", priority: "medium" },
      ];
      setNotifications(mockNotifications);
    }
  };

  useEffect(() => {
    fetchVendorData();
    fetchNotifications();
    
    // Set up interval to refresh data
    const dataInterval = setInterval(fetchVendorData, 300000); // 5 minutes
    const notificationInterval = setInterval(fetchNotifications, 60000); // 1 minute

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
      clearInterval(dataInterval);
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

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return '🛒';
      case 'payment': return '💰';
      case 'subscription': return '📅';
      case 'delivery': return '🚚';
      case 'review': return '⭐';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
            {/* Notifications */}
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
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white text-[10px] sm:text-xs animate-pulse"
                    style={{ backgroundColor: designTokens.colors.accent.red }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50"
                  style={{ borderColor: designTokens.colors.border.medium }}
                >
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div>
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500">
                        {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 hover:bg-blue-50 rounded"
                        >
                          Mark all read
                        </button>
                      )}
                      <button 
                        onClick={clearAllNotifications}
                        className="text-xs text-red-600 hover:text-red-800 px-3 py-1 hover:bg-red-50 rounded"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''} ${getPriorityColor(notification.priority)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-lg mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-900 font-medium">{notification.message}</p>
                                {!notification.read && (
                                  <button 
                                    onClick={() => markNotificationAsRead(notification.id)} 
                                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">{notification.time}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${notification.priority === 'high' ? 'bg-red-100 text-red-800' : notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {notification.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No notifications</p>
                        <p className="text-sm mt-1">You're all caught up!</p>
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
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden z-50"
                  style={{
                    backgroundColor: designTokens.colors.background.primary,
                    border: `1px solid ${designTokens.colors.border.medium}`,
                  }}
                >
                  {/* Vendor Info Section */}
                  <div
                    className="px-4 py-5 border-b bg-gradient-to-r from-green-50 to-gray-50"
                    style={{ borderColor: designTokens.colors.border.light }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-3 border-white shadow-sm bg-gradient-to-br from-green-100 to-green-50">
                          <img
                            src={getProfilePictureSrc()}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = defaultUser;
                            }}
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(getVendorStatus()).icon}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className="text-lg font-bold mb-1"
                              style={{ color: designTokens.colors.text.primary }}
                            >
                              {getDisplayName()}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(getVendorStatus()).bg} ${getStatusColor(getVendorStatus()).text} ${getStatusColor(getVendorStatus()).border}`}>
                                <Store size={10} className="inline mr-1" />
                                {getVendorStatus()}
                              </span>
                              <Shield size={12} className="text-green-600" />
                              <span className="text-xs text-gray-600">Verified Vendor</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600 truncate">{getVendorEmail()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600">{getVendorPhone()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="py-3 px-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/vendor/dashboard");
                        }}
                        className="text-sm px-3 py-2 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{ color: designTokens.colors.secondary.main }}
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/vendor/earnings");
                        }}
                        className="text-sm px-3 py-2 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{ color: designTokens.colors.secondary.main }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Earnings
                      </button>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <UserCircle size={18} className="text-green-600" />
                      <div>
                        <span className="text-sm font-medium">My Profile</span>
                        <p className="text-xs text-gray-500">View and edit your profile</p>
                      </div>
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left hover:bg-gray-50"
                      style={{ color: designTokens.colors.text.primary }}
                    >
                      <Settings size={18} className="text-green-600" />
                      <div>
                        <span className="text-sm font-medium">Settings</span>
                        <p className="text-xs text-gray-500">Manage account settings</p>
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
                      <LogOut size={18} />
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