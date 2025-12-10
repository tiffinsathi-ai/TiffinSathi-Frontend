import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  Settings,
  BarChart3,
  CreditCard
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const designTokens = {
  colors: {
    secondary: {
      main: "#3B82F6",
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
};

const AdminSidebar = ({ isOpen, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { id: "users", icon: Users, label: "User Management", path: "/admin/user-management" },
    { id: "vendors", icon: Store, label: "Vendor Management", path: "/admin/vendor-management" },
    { id: "payments", icon: CreditCard, label: "Payment Management", path: "/admin/payment-management" },
    { id: "analytics", icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { id: "system", icon: Settings, label: "System Settings", path: "/admin/settings" },
  ];

  if (!isOpen) return null;

  return (
    // Changed h-screen to h-full so it fits inside the calculated fixed container
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== "/admin" && location.pathname.startsWith(item.path));
          const isHovered = hoveredItem === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onItemClick}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2"
              style={{
                backgroundColor: isActive
                  ? designTokens.colors.secondary.main
                  : isHovered
                  ? "#F3F4F6"
                  : "transparent",
                color: isActive
                  ? designTokens.colors.text.inverse
                  : designTokens.colors.text.primary,
                textDecoration: "none",
                fontWeight: isActive ? "600" : "500",
              }}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;