<<<<<<< HEAD
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
=======
import React, { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ShoppingBag,
  User,
  Truck,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const designTokens = {
  colors: {
    secondary: {
      main: "#6DB33F",
    },
    background: {
      primary: "#FFFFFF",
    },
    text: {
      primary: "#212529",
      inverse: "#FFFFFF",
    },
    border: {
      light: "#E9ECEF",
    },
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
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

<<<<<<< HEAD
const VendorSidebar = ({ isOpen = true }) => {
  const loc = useLocation();
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();
=======
  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/vendor/dashboard",
    },
    {
      id: "food-items",
      icon: UtensilsCrossed,
      label: "Food Items",
      path: "/vendor/food-items",
    },
    {
      id: "meal-packages",
      icon: Package,
      label: "Meal Packages",
      path: "/vendor/meal-packages",
    },
    {
      id: "orders",
      icon: ShoppingBag,
      label: "Orders",
      path: "/vendor/orders",
    },
    {
      id: "customers",
      icon: User,
      label: "Customers",
      path: "/vendor/customers",
    },
    {
      id: "delivery",
      icon: Truck,
      label: "Delivery",
      path: "/vendor/delivery",
    },
  ];
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
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
=======
    <aside
      className="w-64 sticky top-16 border-r"
      style={{
        backgroundColor: designTokens.colors.background.primary,
        borderColor: designTokens.colors.border.light,
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      <nav className="p-4 overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (index === 0 && location.pathname.startsWith("/vendor"));
          const isHovered = hoveredItem === item.id;
          const isFirst = index === 0;
          const marginTop = isFirst ? "0" : "0.5rem";

          return (
            <Link
              key={item.id}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? designTokens.colors.secondary.main
                  : "transparent",
                color: isActive
                  ? designTokens.colors.text.inverse
                  : designTokens.colors.text.primary,
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal",
                marginTop: marginTop,
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
    </aside>
  );  
};

export default VendorSidebar;