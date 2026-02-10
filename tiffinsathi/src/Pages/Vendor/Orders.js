// src/Pages/Vendor/Orders.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  AlertCircle,
  DollarSign,
  Users,
  ShoppingBag,
  X,
  Eye,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { vendorApi } from "../../helpers/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState({});
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    activeSubscriptions: 0,
    orderGrowth: 0
  });
  const [activeTab, setActiveTab] = useState("today");
  const navigate = useNavigate();

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOrders(),
        loadUpcomingOrders(),
        loadDeliveryPartners(),
        loadStats()
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadOrders = async () => {
    try {
      const response = await vendorApi.getVendorOrders(dateFilter);
      if (response.ok) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
        
        // Calculate growth if we have previous data
        if (ordersData.length > 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          try {
            const yesterdayResponse = await vendorApi.getVendorOrders(yesterdayStr);
            if (yesterdayResponse.ok && Array.isArray(yesterdayResponse.data)) {
              const yesterdayCount = yesterdayResponse.data.length;
              const todayCount = ordersData.length;
              const growth = yesterdayCount > 0 
                ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
                : 100;
              
              setStats(prev => ({ ...prev, orderGrowth: growth }));
            }
          } catch (e) {
            console.error("Could not load yesterday's data for growth calculation:", e);
          }
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const loadStats = async () => {
    try {
      // Get today's orders for stats
      const today = new Date().toISOString().split('T')[0];
      const ordersResponse = await vendorApi.getVendorOrders(today);
      
      if (ordersResponse.ok) {
        const todayOrders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        
        // Get active subscriptions count
        const subscriptionsResponse = await vendorApi.getVendorSubscriptions("ACTIVE");
        const activeSubscriptions = subscriptionsResponse.ok && Array.isArray(subscriptionsResponse.data) 
          ? subscriptionsResponse.data.length 
          : 0;
        
        // Calculate stats
        const pendingOrders = todayOrders.filter(order => 
          ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(order.status)
        ).length;
        
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalOrders: todayOrders.length,
          pendingOrders,
          todayRevenue,
          activeSubscriptions
        }));
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadUpcomingOrders = async () => {
    setLoadingUpcoming(true);
    try {
      const response = await vendorApi.getUpcomingOrders();
      if (response.ok) {
        setUpcomingOrders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Error loading upcoming orders:", err);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const loadDeliveryPartners = async () => {
    try {
      const response = await vendorApi.getDeliveryPartners();
      if (response.ok) {
        setDeliveryPartners(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Error loading delivery partners:", err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, deliveryPersonId = null) => {
    try {
      const response = await vendorApi.updateOrderStatus(orderId, newStatus, deliveryPersonId);
      if (response.ok) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        if (deliveryPersonId && newStatus === "ASSIGNED") {
          const partner = deliveryPartners.find(p => p.partnerId === deliveryPersonId);
          setSelectedDeliveryPartner(prev => ({
            ...prev,
            [orderId]: partner
          }));
        }
        
        // Reload stats to update counts
        setTimeout(loadStats, 100);
      } else {
        setError("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Error updating order status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
      PREPARING: "bg-orange-50 text-orange-700 border-orange-200",
      READY_FOR_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
      ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-200",
      OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Clock className="text-yellow-600" size={14} />,
      CONFIRMED: <CheckCircle className="text-blue-600" size={14} />,
      PREPARING: <Clock className="text-orange-600" size={14} />,
      READY_FOR_DELIVERY: <Package className="text-purple-600" size={14} />,
      ASSIGNED: <Truck className="text-indigo-600" size={14} />,
      OUT_FOR_DELIVERY: <Truck className="text-purple-600" size={14} />,
      DELIVERED: <CheckCircle className="text-green-600" size={14} />,
      CANCELLED: <XCircle className="text-red-600" size={14} />,
      COMPLETED: <CheckCircle className="text-emerald-600" size={14} />
    };
    return icons[status] || <Package className="text-gray-600" size={14} />;
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "today":
        return orders.filter(order => 
          ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(order.status)
        );
      case "assigned":
        return orders.filter(order => 
          ["ASSIGNED", "OUT_FOR_DELIVERY", "PICKED_UP", "ARRIVED"].includes(order.status)
        );
      case "delivered":
        return orders.filter(order => 
          ["DELIVERED", "COMPLETED"].includes(order.status)
        );
      case "upcoming":
        return upcomingOrders;
      case "cancelled":
        return orders.filter(order => 
          ["CANCELLED"].includes(order.status)
        );
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  // Professional StatCard Component - Clean and professional
  const StatCard = ({ title, value, icon: Icon, color, onClick, trendValue }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50"
    };

    return (
      <div 
        className={`bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-green-300' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {trendValue !== undefined && (
            <div className={`flex items-center text-sm ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1 font-medium">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track customer orders</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                }}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Stats Cards - Professional without "click to view" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="blue"
          trendValue={stats.orderGrowth}
          onClick={() => {
            setActiveTab("today");
            document.getElementById("orders-list")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="orange"
          onClick={() => {
            setActiveTab("today");
            setStatusFilter("PENDING");
            document.getElementById("orders-list")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          onClick={() => navigate("/vendor/earnings")}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={Users}
          color="purple"
          onClick={() => navigate("/vendor/subscriptions")}
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by order ID, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6" id="orders-list">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "today"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("today")}
            >
              <Clock size={16} />
              <span>Today's Orders</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "today" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {orders.filter(o => 
                  ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(o.status)
                ).length}
              </span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "assigned"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("assigned")}
            >
              <Truck size={16} />
              <span>Assigned</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "assigned" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {orders.filter(o => 
                  ["ASSIGNED", "OUT_FOR_DELIVERY", "PICKED_UP", "ARRIVED"].includes(o.status)
                ).length}
              </span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "delivered"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("delivered")}
            >
              <CheckCircle size={16} />
              <span>Delivered</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "delivered" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {orders.filter(o => 
                  ["DELIVERED", "COMPLETED"].includes(o.status)
                ).length}
              </span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "upcoming"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              <Calendar size={16} />
              <span>Upcoming</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "upcoming" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {upcomingOrders.length}
              </span>
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "cancelled"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("cancelled")}
            >
              <XCircle size={16} />
              <span>Cancelled</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "cancelled" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {orders.filter(o => ["CANCELLED"].includes(o.status)).length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "today" && "Today's Orders"}
                {activeTab === "assigned" && "Assigned Orders"}
                {activeTab === "delivered" && "Delivered Orders"}
                {activeTab === "upcoming" && "Upcoming Orders"}
                {activeTab === "cancelled" && "Cancelled Orders"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {formatDate(dateFilter)} • {filteredOrders.length} orders
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin text-green-600 mx-auto mb-4" size={32} />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : 
          
          /* Empty State */
          filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === "today" && "No orders for today"}
                {activeTab === "assigned" && "No assigned orders"}
                {activeTab === "delivered" && "No delivered orders"}
                {activeTab === "upcoming" && "No upcoming orders"}
                {activeTab === "cancelled" && "No cancelled orders"}
              </h3>
              <p className="text-gray-600">
                {activeTab === "today" && "All caught up! No orders require attention."}
                {activeTab === "assigned" && "No orders are currently assigned to delivery partners."}
                {activeTab === "delivered" && "No orders have been delivered yet."}
                {activeTab === "upcoming" && "No upcoming orders scheduled."}
                {activeTab === "cancelled" && "No orders have been cancelled."}
              </p>
            </div>
          ) : 
          
          /* Orders List */
          (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status).split(' ')[0]}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-600">
                            Customer: {order.customer?.userName || "Customer"} • 
                            Phone: {order.customer?.phoneNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {expandedOrder === order.orderId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details - Expanded View */}
                  {expandedOrder === order.orderId && (
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Customer Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 w-24">Name:</span>
                              <span className="font-medium">{order.customer?.userName || "N/A"}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{order.customer?.phoneNumber || "N/A"}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{order.customer?.email || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Delivery Information
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                            {order.landmark && (
                              <p className="text-sm text-gray-600">Landmark: {order.landmark}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              Delivery: {order.deliveryDate} at {order.preferredDeliveryTime || "Flexible"}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                          <div className="bg-white rounded-lg border">
                            {order.orderMeals?.map((meal, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
                                <div>
                                  <p className="font-medium text-sm">{meal.mealSetName}</p>
                                  <p className="text-xs text-gray-500">{meal.mealSetType}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">Qty: {meal.quantity}</p>
                                  <p className="text-xs text-gray-500">₹{meal.price || 0} each</p>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between items-center p-3 bg-gray-50">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-green-600">₹{order.totalAmount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - FUNCTIONAL */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, "CONFIRMED")}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Confirm Order
                            </button>
                          )}

                          {order.status === "CONFIRMED" && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, "PREPARING")}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                              Start Preparing
                            </button>
                          )}

                          {order.status === "PREPARING" && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, "READY_FOR_DELIVERY")}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                              Mark Ready for Delivery
                            </button>
                          )}

                          {order.status === "READY_FOR_DELIVERY" && deliveryPartners.length > 0 && (
                            <div className="flex items-center gap-2">
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateOrderStatus(order.orderId, "ASSIGNED", e.target.value);
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>Select Delivery Partner</option>
                                {deliveryPartners
                                  .filter(partner => partner.isActive)
                                  .map(partner => (
                                    <option key={partner.partnerId} value={partner.partnerId}>
                                      {partner.name} ({partner.phoneNumber || "No phone"})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                            <button
                              onClick={() => updateOrderStatus(order.orderId, "CANCELLED")}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Cancel Order
                            </button>
                          )}

                          {["ASSIGNED", "OUT_FOR_DELIVERY", "PICKED_UP"].includes(order.status) && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Truck className="h-4 w-4" />
                              <span>Assigned to: {selectedDeliveryPartner[order.orderId]?.name || "Delivery Partner"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary - Collapsed View */}
                  {expandedOrder !== order.orderId && (
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{order.customer?.userName || "Customer"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{order.orderMeals?.length || 0} items</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">₹{order.totalAmount || 0}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;