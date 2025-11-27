// src/Components/Vendor/VendorSidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  UtensilsCrossed,
  Package,
  FileText,
  Users,
  Truck,
  Star,
  Settings,
  LogOut,
} from "lucide-react";

const designTokens = {
  colors: {
    primary: {
      main: "#16A34A",
      hover: "#15803D",
    },
    neutral: {
      gray400: "#D1D5DB",
      gray800: "#1F2937",
    },
    background: {
      dark: "#1F2937",
    },
    text: {
      inverse: "#FFFFFF",
    },
  },
};

const menu = [
  { id: "dashboard", icon: BarChart3, label: "Dashboard", to: "/vendor/dashboard" },
  { id: "tiffins", icon: UtensilsCrossed, label: "My Tiffins", to: "/vendor/tiffins" },
  { id: "orders", icon: Package, label: "Orders", to: "/vendor/orders" },
  { id: "analytics", icon: BarChart3, label: "Analytics", to: "/vendor/analytics" },
  { id: "earnings", icon: FileText, label: "Earnings", to: "/vendor/earnings" },
  { id: "customers", icon: Users, label: "Customers", to: "/vendor/customers" },
  { id: "subscriptions", icon: Package, label: "Subscriptions", to: "/vendor/subscriptions" }, 
  { id: "delivery", icon: Truck, label: "Delivery Partners", to: "/vendor/delivery-partners" },
  { id: "reviews", icon: Star, label: "Reviews", to: "/vendor/reviews" },
  { id: "settings", icon: Settings, label: "Settings", to: "/vendor/settings" },
];

const VendorSidebar = ({ isOpen = true }) => {
  const loc = useLocation();
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <aside className="w-64 h-screen sticky top-16 overflow-y-auto" style={{ backgroundColor: designTokens.colors.background.dark }}>
      <div className="p-4">
        <img src="/src/assets/admin-banner.jpg" alt="logo" className="w-full h-20 object-cover rounded mb-4" />

        <nav className="space-y-2">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = loc.pathname === m.to || loc.pathname.startsWith(m.to + "/");

            return (
              <Link
                key={m.id}
                to={m.to}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: active ? designTokens.colors.primary.main : hovered === m.id ? designTokens.colors.neutral.gray800 : "transparent",
                  color: active || hovered === m.id ? designTokens.colors.text.inverse : designTokens.colors.neutral.gray400,
                  textDecoration: "none",
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{m.label}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );  
};

export default VendorSidebar;