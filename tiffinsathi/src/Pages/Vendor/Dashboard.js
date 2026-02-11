// src/Pages/Vendor/Dashboard.js
import React, { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Truck,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  ChevronRight,
  Bell,
  ChefHat,
  MapPin,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        todayOrdersResponse,
        activeSubscriptionsResponse,
        activePartnersResponse,
        vendorOrdersResponse
      ] = await Promise.all([
        api.orders.getTodayOrders().catch(err => []), // Handle potential errors
        api.subscriptions.getVendorActiveSubscriptions().catch(err => []),
        api.deliveryPartners.getVendorActivePartners().catch(err => []),
        api.orders.getVendorOrders().catch(err => [])
      ]);

      // Extract data from responses (handle different response structures)
      const todayOrders = Array.isArray(todayOrdersResponse) ? todayOrdersResponse : 
                         (todayOrdersResponse?.data || []);
      const activeSubscriptions = Array.isArray(activeSubscriptionsResponse) ? activeSubscriptionsResponse : 
                                 (activeSubscriptionsResponse?.data || []);
      const activePartners = Array.isArray(activePartnersResponse) ? activePartnersResponse : 
                           (activePartnersResponse?.data || []);
      const vendorOrders = Array.isArray(vendorOrdersResponse) ? vendorOrdersResponse : 
                         (vendorOrdersResponse?.data || []);

      // Calculate today's revenue from today's orders
      const todayRevenue = todayOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || order.price || 0);
      }, 0);

      // Format data for the dashboard
      const stats = [
        { 
          id: 1, 
          title: "Today's Orders", 
          value: todayOrders.length.toString(), 
          icon: ShoppingBag, 
          color: "blue", 
          trend: "+0%", // Placeholder - could calculate from yesterday's data
          onClick: () => navigate('/vendor/orders'),
          description: "Orders for today"
        },
        { 
          id: 2, 
          title: "Active Subscriptions", 
          value: activeSubscriptions.length.toString(), 
          icon: Users, 
          color: "green", 
          trend: "+0%", // Placeholder
          onClick: () => navigate('/vendor/subscriptions'),
          description: "Active subscription plans"
        },
        { 
          id: 3, 
          title: "Delivery Partners", 
          value: activePartners.length.toString(), 
          icon: Truck, 
          color: "purple", 
          trend: "+0", // Placeholder
          onClick: () => navigate('/vendor/delivery-partners'),
          description: "Active delivery partners"
        },
        { 
          id: 4, 
          title: "Today's Revenue", 
          value: `Rs. ${todayRevenue.toLocaleString()}`, 
          icon: DollarSign, 
          color: "orange", 
          trend: "+0%", // Placeholder
          onClick: () => navigate('/vendor/earnings'),
          description: "Revenue from today's orders"
        }
      ];

      // Get recent orders (last 7 from vendor orders)
      const recentOrders = vendorOrders
        .slice(0, 7)
        .map((order, index) => ({
          id: order.orderId || order.id || `order-${index}`,
          orderNumber: order.orderNumber || `TS-${order.id || index}`,
          customer: order.customerName || order.customer?.name || "Customer",
          items: order.items ? `${Array.isArray(order.items) ? order.items.length : 1} items` : "Meal Plan",
          amount: `Rs. ${order.totalAmount || order.price || 0}`,
          status: order.orderStatus || order.status || "PENDING",
          time: formatTimeAgo(order.createdAt || new Date().toISOString()),
          deliveryAddress: order.deliveryAddress || order.address || "Address not specified"
        }));

      // Get business name from localStorage
      const businessName = localStorage.getItem("businessName") || localStorage.getItem("name") || "Vendor";

      setDashboardData({
        stats,
        recentOrders,
        businessName,
        vendorOrdersCount: vendorOrders.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      // Set minimal data to maintain UI structure
      setDashboardData({
        stats: [
          { 
            id: 1, 
            title: "Today's Orders", 
            value: "0", 
            icon: ShoppingBag, 
            color: "blue", 
            trend: "+0%",
            onClick: () => navigate('/vendor/orders'),
            description: "No data available"
          },
          { 
            id: 2, 
            title: "Active Subscriptions", 
            value: "0", 
            icon: Users, 
            color: "green", 
            trend: "+0%",
            onClick: () => navigate('/vendor/subscriptions'),
            description: "No data available"
          },
          { 
            id: 3, 
            title: "Delivery Partners", 
            value: "0", 
            icon: Truck, 
            color: "purple", 
            trend: "+0",
            onClick: () => navigate('/vendor/delivery-partners'),
            description: "No data available"
          },
          { 
            id: 4, 
            title: "Today's Revenue", 
            value: "Rs. 0", 
            icon: DollarSign, 
            color: "orange", 
            trend: "+0%",
            onClick: () => navigate('/vendor/earnings'),
            description: "No data available"
          }
        ],
        recentOrders: [],
        businessName: localStorage.getItem("businessName") || localStorage.getItem("name") || "Vendor",
        vendorOrdersCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    } catch (e) {
      return "Recently";
    }
  };

  const CompactStatCard = ({ title, value, icon: Icon, color, trend, onClick, description }) => {
    const colorClasses = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100 hover:border-blue-300" },
      green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100 hover:border-green-300" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100 hover:border-purple-300" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100 hover:border-orange-300" },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div 
        className={`bg-white p-4 rounded-lg border ${colors.border} hover:shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            <Icon className="h-4 w-4" />
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="ml-1">{trend}</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      DELIVERED: { color: "bg-green-100 text-green-800 border-green-200", label: "Delivered" },
      PREPARING: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Preparing" },
      OUT_FOR_DELIVERY: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Out for Delivery" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Confirmed" },
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      READY_FOR_DELIVERY: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Ready" },
      CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
      COMPLETED: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" }
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: status };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="text-red-600 mb-4" size={32} />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="text-gray-400 mb-4" size={32} />
        <p className="text-gray-600">No dashboard data available</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Load Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {dashboardData.businessName}!</h1>
            <p className="opacity-90">Here's your business overview for today</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-xl md:text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="opacity-90 mt-1">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Compact Stats Grid - Only 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.stats.map((stat) => (
          <CompactStatCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button 
                  onClick={() => navigate("/vendor/orders")}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentOrders.map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                      <div className="flex items-start sm:items-center space-x-4 mb-3 sm:mb-0">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 flex-shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="mb-2">
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="font-medium text-gray-900">{order.amount}</p>
                        <p className="text-sm text-gray-500">{order.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Orders</h3>
                  <p className="text-gray-500">You haven't received any orders yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.vendorOrdersCount || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats[0].value}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats[1].value}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Delivery Partners</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats[2].value}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button 
                  onClick={() => navigate("/vendor/orders")}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all flex items-center hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mr-3 flex-shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Orders</p>
                    <p className="text-sm text-gray-600">Update status, track deliveries</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate("/vendor/tiffins")}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all flex items-center hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg bg-green-50 text-green-600 mr-3 flex-shrink-0">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Meal Plans</p>
                    <p className="text-sm text-gray-600">Add/edit meal plans</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate("/vendor/subscriptions")}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all flex items-center hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mr-3 flex-shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Subscriptions</p>
                    <p className="text-sm text-gray-600">Manage plans & renewals</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate("/vendor/delivery-partners")}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all flex items-center hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg bg-orange-50 text-orange-600 mr-3 flex-shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery Partners</p>
                    <p className="text-sm text-gray-600">Manage delivery team</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Connection</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Refresh</span>
                <button 
                  onClick={fetchDashboardData}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <Bell className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Update Order Status</p>
              <p className="text-sm text-blue-700">Keep order status updated for better tracking</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Manage Subscriptions</p>
              <p className="text-sm text-blue-700">Check active subscriptions regularly</p>
            </div>
          </div>
          <div className="flex items-start">
            <Truck className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Delivery Partners</p>
              <p className="text-sm text-blue-700">Ensure delivery partners are available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;