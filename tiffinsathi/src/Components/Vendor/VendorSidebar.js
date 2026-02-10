// src/Components/Vendor/VendorSidebar.js
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  BarChart3,
  CreditCard,
  Users,
  Truck,
  Star,
  Settings,
  Calendar,
  LogOut
} from "lucide-react";
import { vendorApi } from "../../helpers/api";

const VendorSidebar = ({ isOpen, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch pending orders count
  const fetchPendingOrdersCount = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await vendorApi.getVendorOrders(today);
      
      if (response.ok && Array.isArray(response.data)) {
        // Count orders that need attention (PENDING, CONFIRMED, PREPARING)
        const pendingCount = response.data.filter(order => 
          ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(order.status)
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
      const intervalId = setInterval(fetchPendingOrdersCount, 30000);
      
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

  // Menu items with corrected dashboard path
  const menuItems = [
    { 
      id: "dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/vendor",
      description: "Overview & analytics"
    },
    { 
      id: "tiffins", 
      icon: UtensilsCrossed, 
      label: "My Tiffins", 
      path: "/vendor/tiffins",
      description: "Manage your tiffins"
    },
    { 
      id: "orders", 
      icon: Package, 
      label: "Orders", 
      path: "/vendor/orders",
      showBadge: true,
      description: "Manage customer orders"
    },
    { 
      id: "subscriptions", 
      icon: Calendar, 
      label: "Subscriptions", 
      path: "/vendor/subscriptions",
      description: "Active subscriptions"
    },
    { 
      id: "earnings", 
      icon: CreditCard, 
      label: "Earnings", 
      path: "/vendor/earnings",
      description: "Revenue & payments"
    },
    { 
      id: "customers", 
      icon: Users, 
      label: "Customers", 
      path: "/vendor/customers",
      description: "Customer database"
    },
    { 
      id: "delivery", 
      icon: Truck, 
      label: "Delivery Partners", 
      path: "/vendor/delivery-partners",
      description: "Delivery management"
    },
    { 
      id: "reviews", 
      icon: Star, 
      label: "Reviews", 
      path: "/vendor/reviews",
      description: "Customer feedback"
    },
    { 
      id: "settings", 
      icon: Settings, 
      label: "Settings", 
      path: "/vendor/settings",
      description: "Account settings"
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation - No header */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.id === "dashboard" ? location.pathname === "/vendor" : 
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
                    setTimeout(fetchPendingOrdersCount, 100);
                  }
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-start space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                  ${isActive ? 'bg-green-50 border border-green-200' : 
                    isHovered ? 'bg-gray-50' : 'bg-transparent border border-transparent'}`}
              >
                <div className={`p-2 rounded-lg transition-colors
                  ${isActive ? 'bg-green-100 text-green-600' : 
                    'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'}`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium transition-colors
                      ${isActive ? 'text-green-700' : 'text-gray-900 group-hover:text-green-700'}`}>
                      {item.label}
                    </span>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {loading ? (
                          <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                        ) : (
                          Math.min(pendingOrdersCount, 99)
                        )}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                
                {isActive && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Removed Support Section */}
      </nav>

      {/* Footer Section - Simplified */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            // Clear authentication tokens
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("email");
            localStorage.removeItem("name");
            localStorage.removeItem("businessName");
            localStorage.removeItem("vendorId");
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-all hover:shadow-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default VendorSidebar;