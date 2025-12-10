// layout/DeliverySidebar.js
import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Clock,
  BarChart3,
  User
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const designTokens = {
  colors: {
    secondary: {
      main: "#D94826", // Orange for delivery theme
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

const DeliverySidebar = ({ isOpen, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/delivery" },
    { id: "deliveries", icon: Package, label: "My Deliveries", path: "/delivery/deliveries" },
    { id: "routes", icon: MapPin, label: "Delivery Routes", path: "/delivery/routes" },
    { id: "schedule", icon: Clock, label: "Schedule", path: "/delivery/schedule" },
    { id: "performance", icon: BarChart3, label: "Performance", path: "/delivery/performance" },
    { id: "profile", icon: User, label: "My Profile", path: "/delivery/profile" },
  ];

  if (!isOpen) return null;

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== "/delivery" && location.pathname.startsWith(item.path));
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

export default DeliverySidebar;