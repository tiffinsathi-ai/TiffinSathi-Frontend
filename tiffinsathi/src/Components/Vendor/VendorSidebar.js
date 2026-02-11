// src/Components/Vendor/VendorSidebar.js
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  CreditCard,
  Users,
  Truck,
  Calendar,
} from "lucide-react";
import { vendorApi } from "../../helpers/api";

const designTokens = {
  colors: {
    secondary: {
      main: "#16A34A",
    },
    background: {
      primary: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      inverse: "#FFFFFF",
    },
    border: {
      light: "#E2E8F0",
    },
  },
};

const VendorSidebar = ({ isOpen, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Fetch pending orders count
  const fetchPendingOrdersCount = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await vendorApi.getVendorOrders(today);

      if (response.ok && Array.isArray(response.data)) {
        // Count orders that need attention (PENDING, CONFIRMED, PREPARING)
        const pendingCount = response.data.filter((order) =>
          ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(
            order.status,
          ),
        ).length;

        setPendingOrdersCount(pendingCount);
      }
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and set up refresh interval
  useEffect(() => {
    if (isOpen) {
      fetchPendingOrdersCount();

      // Set up interval to refresh every 30 seconds
      const intervalId = setInterval(fetchPendingOrdersCount, 10000);

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [isOpen, fetchPendingOrdersCount]);

  // Also refresh count when navigating to/from orders page
  useEffect(() => {
    if (location.pathname.includes("/vendor/orders")) {
      fetchPendingOrdersCount();
    }
  }, [location.pathname, fetchPendingOrdersCount]);

  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/vendor/dashboard",
    },
    {
      id: "tiffins",
      icon: UtensilsCrossed,
      label: "My Tiffins",
      path: "/vendor/tiffins",
    },
    {
      id: "orders",
      icon: Package,
      label: "Orders",
      path: "/vendor/orders",
      showBadge: true,
    },
    {
      id: "subscriptions",
      icon: Calendar,
      label: "Subscriptions",
      path: "/vendor/subscriptions",
    },
    {
      id: "earnings",
      icon: CreditCard,
      label: "Earnings",
      path: "/vendor/earnings",
    },
    {
      id: "customers",
      icon: Users,
      label: "Customers",
      path: "/vendor/customers",
    },
    {
      id: "delivery",
      icon: Truck,
      label: "Delivery Partners",
      path: "/vendor/delivery-partners",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/vendor/dashboard" &&
              location.pathname.startsWith(item.path));
          const isHovered = hoveredItem === item.id;
          const showBadge = item.showBadge && pendingOrdersCount > 0;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => {
                if (onItemClick) onItemClick();
                if (item.id === "orders") {
                  // Refresh count when clicking on orders
                  setTimeout(fetchPendingOrdersCount, 50);
                }
              }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2 relative"
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
              {showBadge && (
                <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {loading ? (
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    Math.min(pendingOrdersCount, 99) // Show max 99
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default VendorSidebar;
