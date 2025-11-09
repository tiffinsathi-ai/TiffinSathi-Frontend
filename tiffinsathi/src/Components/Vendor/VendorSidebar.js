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
  },
};

const VendorSidebar = ({ isOpen }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

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
    </aside>
  );
};

export default VendorSidebar;
