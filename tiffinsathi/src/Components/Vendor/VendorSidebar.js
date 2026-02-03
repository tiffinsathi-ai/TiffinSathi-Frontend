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
  Home,
  PieChart,
  Bell,
  HelpCircle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  LogOut
} from "lucide-react";
import { vendorApi } from "../../helpers/api";
import authStorage from "../../helpers/authStorage";

const designTokens = {
  colors: {
    secondary: {
      main: "#16A34A",
      light: "#DCFCE7",
      dark: "#15803D"
    },
    background: {
      primary: "#FFFFFF",
      dark: "#0F172A"
    },
    text: {
      primary: "#1E293B",
      secondary: "#475569",
      inverse: "#FFFFFF",
      light: "#94A3B8"
    },
    border: {
      light: "#E2E8F0",
      medium: "#CBD5E1"
    },
    status: {
      active: "#16A34A",
      pending: "#F59E0B",
      warning: "#F97316",
      error: "#EF4444"
    }
  }
};

const VendorSidebar = ({ isOpen, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [vendorStatus, setVendorStatus] = useState(null);
  const [activeOrders, setActiveOrders] = useState(0);
  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      navigate("/login", { 
        state: { message: "Please login to access vendor portal" } 
      });
    }
  }, [navigate]);

  // Fetch vendor data
  const fetchVendorData = useCallback(async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const response = await vendorApi.getVendorProfile();
      if (response.ok && response.data) {
        setVendorStatus(response.data.status || "PENDING");
        
        // Store vendor status for quick access
        localStorage.setItem("vendorStatus", response.data.status);
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      if (error.response?.status === 401) {
        authStorage.clearAuth();
        navigate("/login", { 
          state: { message: "Session expired. Please login again." } 
        });
      }
    }
  }, [navigate]);

  // Fetch pending orders count and stats
  const fetchOrdersStats = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await vendorApi.getVendorOrders(today);
      
      if (response.ok && Array.isArray(response.data)) {
        // Count orders that need attention
        const pendingCount = response.data.filter(order => 
          ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(order.status)
        ).length;
        
        const activeCount = response.data.filter(order => 
          ["CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"].includes(order.status)
        ).length;
        
        // Calculate today's revenue
        const todayRevenue = response.data
          .filter(order => order.status === "DELIVERED" || order.status === "COMPLETED")
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        setPendingOrdersCount(pendingCount);
        setActiveOrders(activeCount);
        setTodaysRevenue(todayRevenue);
      }
    } catch (error) {
      console.error("Error fetching orders stats:", error);
      if (error.response?.status === 401) {
        authStorage.clearAuth();
        navigate("/login", { 
          state: { message: "Session expired. Please login again." } 
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial fetch and set up refresh interval
  useEffect(() => {
    if (isOpen) {
      fetchVendorData();
      fetchOrdersStats();
      
      // Set up interval to refresh stats
      const intervalId = setInterval(fetchOrdersStats, 30000); // Refresh every 30 seconds
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [isOpen, fetchVendorData, fetchOrdersStats]);

  // Also refresh when navigating to/from orders page
  useEffect(() => {
    if (location.pathname.includes("/vendor/orders") || 
        location.pathname.includes("/vendor/dashboard")) {
      fetchOrdersStats();
    }
  }, [location.pathname, fetchOrdersStats]);

  const getStatusIcon = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch(statusUpper) {
      case "ACTIVE":
      case "APPROVED":
        return <CheckCircle size={14} className="text-green-500" />;
      case "PENDING":
      case "REVIEW":
        return <Clock size={14} className="text-yellow-500" />;
      case "SUSPENDED":
      case "BLOCKED":
      case "REJECTED":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Shield size={14} className="text-gray-500" />;
    }
  };

  const menuItems = [
    { 
      id: "dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/vendor/dashboard",
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
      id: "analytics", 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/vendor/analytics",
      description: "Business insights"
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
      label: "Delivery", 
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
      {/* Sidebar Header - Simplified */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Home size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Vendor Portal</h3>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.path !== "/vendor/dashboard" && location.pathname.startsWith(item.path));
            const isHovered = hoveredItem === item.id;
            const showBadge = item.showBadge && pendingOrdersCount > 0;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (onItemClick) onItemClick();
                  // Check token before navigation
                  const token = authStorage.getToken();
                  if (!token) {
                    navigate("/login", { 
                      state: { 
                        message: "Please login to continue",
                        redirectTo: item.path
                      } 
                    });
                    return;
                  }
                  if (item.id === "orders") {
                    // Refresh count when clicking on orders
                    setTimeout(fetchOrdersStats, 100);
                  }
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full flex items-start space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative"
                style={{
                  backgroundColor: isActive
                    ? designTokens.colors.secondary.light
                    : isHovered
                    ? "#F8FAFC"
                    : "transparent",
                  border: isActive 
                    ? `1px solid ${designTokens.colors.secondary.main}`
                    : `1px solid transparent`,
                  textDecoration: "none",
                }}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'} group-hover:bg-green-100 transition-colors`}>
                  <Icon 
                    size={18} 
                    className={
                      isActive 
                        ? "text-green-600" 
                        : isHovered
                        ? "text-green-600"
                        : "text-gray-600"
                    } 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      isActive ? "text-green-700" : "text-gray-900"
                    }`}>
                      {item.label}
                    </span>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {loading ? (
                          <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                        ) : (
                          Math.min(pendingOrdersCount, 99)
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
                
                {isActive && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-1">
            <a
              href="/vendor/help"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            >
              <div className="p-2 rounded-lg bg-blue-50">
                <HelpCircle size={16} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium">Help & Support</span>
            </a>
            <a
              href="/vendor/notifications"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            >
              <div className="p-2 rounded-lg bg-purple-50">
                <Bell size={16} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium">Notifications</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-900">Tiffin Sathi</p>
            <p className="text-xs text-gray-500">Vendor Portal v2.0</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Online</span>
          </div>
        </div>
        <button
          onClick={() => {
            authStorage.clearAuth();
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default VendorSidebar;