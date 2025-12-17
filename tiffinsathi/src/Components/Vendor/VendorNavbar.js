/* eslint-disable no-unused-vars */
// src/Components/Vendor/VendorNavbar.js
import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, User, Settings, LogOut, X } from "lucide-react";
import { authStorage } from "../../helpers/api";
import { useNavigate } from "react-router-dom";

const designTokens = {
  colors: {
    primary: {
      main: "#16A34A",
      hover: "#15803D",
    },
    border: {
      light: "#E5E7EB",
    },
  },
};

const VendorNavbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const user = authStorage.getUser();

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received from John Doe", time: "10 min ago", read: false, type: "order" },
    { id: 2, message: "Subscription #SUB123 is about to expire", time: "1 hour ago", read: false, type: "subscription" },
    { id: 3, message: "Delivery partner assigned to order #456", time: "2 hours ago", read: true, type: "delivery" },
    { id: 4, message: "Payment received for order #789", time: "3 hours ago", read: true, type: "payment" },
  ]);

  useEffect(() => {
    function onDoc(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function logout() {
    authStorage.clearAuth();
    navigate("/login", { replace: true });
  }

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ backgroundColor: designTokens.colors.primary.main }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: designTokens.colors.primary.hover }}
            >
              <Menu size={22} />
            </button>

            <h1 className="text-xl font-bold text-white">Tiffin Sathi Vendor</h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-white hover:bg-green-700 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
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
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-white hover:bg-green-700"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.businessName || user?.name || "Vendor"}</div>
                  <div className="text-xs opacity-80">Vendor Account</div>
                </div>

                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg overflow-hidden"
                  style={{ borderColor: designTokens.colors.border.light }}
                >
                  <button onClick={() => navigate("/vendor/settings")} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700">
                    <Settings size={14} /> Settings
                  </button>

                  <div className="border-t" />

                  <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600">
                    <LogOut size={14} /> Logout
                  </button>
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