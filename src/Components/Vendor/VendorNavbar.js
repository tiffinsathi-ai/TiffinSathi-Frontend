// src/Components/Vendor/VendorNavbar.js
import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = authStorage.getUser();

  useEffect(() => {
    function onDoc(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function logout() {
    authStorage.clearAuth();
    navigate("/login", { replace: true });
  }

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
            <button className="relative p-2 rounded-lg text-white hover:bg-green-700 transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-white hover:bg-green-700"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.name || "Vendor"}</div>
                  <div className="text-xs opacity-80">{user?.email || "vendor@example.com"}</div>
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
                  <button onClick={() => navigate("/vendor/settings")} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
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