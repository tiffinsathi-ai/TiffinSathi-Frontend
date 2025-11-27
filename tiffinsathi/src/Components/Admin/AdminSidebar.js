<<<<<<< HEAD
// src/Components/Admin/AdminSidebar.js
import React, { useState } from 'react';
import { BarChart3, Users, UtensilsCrossed, Package, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const designTokens = {
  colors: {
    primary: { main: '#E85D2C' },
    accent: { red: '#D94826' },
    neutral: { gray400: '#CED4DA', gray800: '#343A40' },
    background: { dark: '#2D2D2D' },
    text: { inverse: '#FFFFFF' }
  }
=======
import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const designTokens = {
  colors: {
    secondary: {
      main: "#3B82F6", // Blue color for admin
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
  },
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
};

const AdminSidebar = ({ isOpen = true }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const menuItems = [
<<<<<<< HEAD
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/user-management' },
    { id: 'vendors', icon: UtensilsCrossed, label: 'Vendors', path: '/admin/vendors-management' },
    { id: 'orders', icon: Package, label: 'Orders', path: '/admin/orders' },
    { id: 'reports', icon: FileText, label: 'Reports', path: '/admin/reports' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' },
=======
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      id: "users",
      icon: Users,
      label: "User Management",
      path: "/admin/users",
    },
    {
      id: "vendors",
      icon: Store,
      label: "Vendor Management",
      path: "/admin/vendors",
    },
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics",
      path: "/admin/analytics",
    },
    {
      id: "system",
      icon: Settings,
      label: "System Settings",
      path: "/admin/settings",
    },
    {
      id: "admin",
      icon: Shield,
      label: "Admin Management",
      path: "/admin/management",
    },
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
  ];

  if (!isOpen) return null;

  return (
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
            (index === 0 && location.pathname.startsWith("/admin"));
          const isHovered = hoveredItem === item.id;
<<<<<<< HEAD
=======
          const isFirst = index === 0;
          const marginTop = isFirst ? "0" : "0.5rem";
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465

          return (
            <Link
              key={item.id}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isActive
<<<<<<< HEAD
                  ? designTokens.colors.primary.main
                  : isHovered
                  ? designTokens.colors.neutral.gray800
                  : 'transparent',
                color:
                  isActive || isHovered
                    ? designTokens.colors.text.inverse
                    : designTokens.colors.neutral.gray400,
                textDecoration: 'none'
=======
                  ? designTokens.colors.secondary.main
                  : isHovered
                  ? "#F3F4F6"
                  : "transparent",
                color: isActive
                  ? designTokens.colors.text.inverse
                  : designTokens.colors.text.primary,
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal",
                marginTop: marginTop,
                border: isActive ? `1px solid ${designTokens.colors.secondary.main}` : "1px solid transparent",
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
<<<<<<< HEAD

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 mt-6 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
=======
>>>>>>> 12ee76fb8ea2c55f29c2526202536502d5042465
      </nav>
    </aside>
  );
};

export default AdminSidebar;