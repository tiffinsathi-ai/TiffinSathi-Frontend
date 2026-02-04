import React, { useState, useEffect, useCallback } from "react";
import { vendorApi } from "../../helpers/api";
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
  Check,
  ChevronRight
} from "lucide-react";

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
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    activeSubscriptions: 0
  });
  const [activeTab, setActiveTab] = useState("today");

  // Load data on component mount and when date changes
  useEffect(() => {
    loadData();
  }, [dateFilter]);

  const loadData = async () => {
    await Promise.all([
      loadOrders(),
      loadUpcomingOrders(),
      loadDeliveryPartners(),
      loadTodayStats()
    ]);
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await vendorApi.getVendorOrders(dateFilter);
      if (response.ok) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.length,
          pendingOrders: ordersData.filter(o => 
            o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING"
          ).length,
          todayRevenue: ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        }));
      } else {
        setError("Failed to load orders");
        setOrders([]);
      }
    } catch (err) {
      setError("Error loading orders: " + err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingOrders = async () => {
    setLoadingUpcoming(true);
    try {
      const response = await vendorApi.getUpcomingOrders();
      if (response.ok) {
        const upcomingData = Array.isArray(response.data) ? response.data : [];
        setUpcomingOrders(upcomingData);
      } else {
        setUpcomingOrders([]);
      }
    } catch (err) {
      console.error("Error loading upcoming orders:", err);
      setUpcomingOrders([]);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const loadDeliveryPartners = async () => {
    try {
      const response = await vendorApi.getDeliveryPartners();
      if (response.ok) {
        const partnersData = Array.isArray(response.data) ? response.data : [];
        setDeliveryPartners(partnersData);
      } else {
        setDeliveryPartners([]);
      }
    } catch (err) {
      console.error("Error loading delivery partners:", err);
      setDeliveryPartners([]);
    }
  };

  const loadTodayStats = async () => {
    try {
      const response = await vendorApi.getTodayStats();
      if (response.ok) {
        const todayData = Array.isArray(response.data) ? response.data : [];
        
        setStats(prev => ({
          ...prev,
          totalOrders: todayData.length,
          pendingOrders: todayData.filter(o => 
            o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING"
          ).length,
          todayRevenue: todayData.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        }));
      }
    } catch (err) {
      console.error("Error loading today stats:", err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, deliveryPersonId = null) => {
    setLoading(true);
    try {
      const response = await vendorApi.updateOrderStatus(orderId, newStatus, deliveryPersonId);
      if (response.ok) {
        await loadOrders();
        
        if (deliveryPersonId && newStatus === "ASSIGNED") {
          const partner = deliveryPartners.find(p => p.partnerId === deliveryPersonId);
          setSelectedDeliveryPartner(prev => ({
            ...prev,
            [orderId]: partner
          }));
        }
      } else {
        setError("Failed to update order status");
      }
    } catch (err) {
      setError("Error updating order status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const assignDeliveryPartner = (orderId, partnerId) => {
    if (!partnerId) {
      setError("Please select a delivery partner");
      return;
    }

    const partner = deliveryPartners.find(p => p.partnerId === partnerId);
    setSelectedDeliveryPartner(prev => ({
      ...prev,
      [orderId]: partner
    }));

    updateOrderStatus(orderId, "ASSIGNED", partnerId);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PREPARING: "bg-orange-100 text-orange-800",
      READY_FOR_DELIVERY: "bg-purple-100 text-purple-800",
      ASSIGNED: "bg-indigo-100 text-indigo-800",
      OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
      PICKED_UP: "bg-blue-100 text-blue-800",
      ARRIVED: "bg-teal-100 text-teal-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      FAILED: "bg-gray-100 text-gray-800",
      COMPLETED: "bg-emerald-100 text-emerald-800",
      PAUSED: "bg-amber-100 text-amber-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Clock className="text-yellow-600" size={14} />,
      CONFIRMED: <CheckCircle className="text-blue-600" size={14} />,
      PREPARING: <Clock className="text-orange-600" size={14} />,
      READY_FOR_DELIVERY: <Package className="text-purple-600" size={14} />,
      ASSIGNED: <Truck className="text-indigo-600" size={14} />,
      OUT_FOR_DELIVERY: <Truck className="text-purple-600" size={14} />,
      PICKED_UP: <Truck className="text-blue-600" size={14} />,
      ARRIVED: <CheckCircle className="text-teal-600" size={14} />,
      DELIVERED: <CheckCircle className="text-green-600" size={14} />,
      CANCELLED: <XCircle className="text-red-600" size={14} />,
      COMPLETED: <CheckCircle className="text-emerald-600" size={14} />
    };
    return icons[status];
  };

  const getAvailableDeliveryPartners = () => {
    return deliveryPartners.filter(partner => 
      (partner.availabilityStatus === "AVAILABLE" || partner.availabilityStatus === "available") && 
      partner.isActive
    );
  };

  // Filter orders based on active tab
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
      case "cancelled":
        return orders.filter(order => 
          ["CANCELLED", "FAILED"].includes(order.status)
        );
      case "upcoming":
        return upcomingOrders;
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon: Icon, color, description }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50"
    };

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    );
  };

  // Tab Button Component
  const TabButton = ({ label, active, onClick, count }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
          active ? "bg-white text-blue-600" : "bg-gray-300 text-gray-700"
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  // OrderCard Component - Responsive
  const OrderCard = ({ order, showActions = true }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
        {/* Header - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
          <div className="mb-2 sm:mb-0">
            <h3 className="font-semibold text-lg text-gray-900">
              Order #{order.orderId}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Customer: {order.customer?.userName || "N/A"}
            </p>
          </div>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(
            order.status
          )}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{order.status.replace(/_/g, ' ')}</span>
          </span>
        </div>

        {/* Simplified info for mobile */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <p className="text-gray-600">Phone:</p>
            <p className="font-medium">{order.customer?.phoneNumber || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Time:</p>
            <p className="font-medium">{order.preferredDeliveryTime || "N/A"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Amount:</p>
            <p className="font-medium text-green-600">₹{order.totalAmount || 0}</p>
          </div>
        </div>

        {/* Actions - Full width on mobile */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-2">
              {order.status === "PENDING" && (
                <button
                  onClick={() => updateOrderStatus(order.orderId, "CONFIRMED")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full sm:w-auto"
                >
                  Confirm Order
                </button>
              )}

              {order.status === "CONFIRMED" && (
                <button
                  onClick={() => updateOrderStatus(order.orderId, "PREPARING")}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 w-full sm:w-auto"
                >
                  Start Preparing
                </button>
              )}

              {order.status === "PREPARING" && (
                <button
                  onClick={() => updateOrderStatus(order.orderId, "READY_FOR_DELIVERY")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 w-full sm:w-auto"
                >
                  Mark Ready
                </button>
              )}

              {order.status === "READY_FOR_DELIVERY" && (
                <div className="w-full">
                  <select
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    onChange={(e) => assignDeliveryPartner(order.orderId, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Delivery Partner</option>
                    {getAvailableDeliveryPartners().map(partner => (
                      <option key={partner.partnerId} value={partner.partnerId}>
                        {partner.name} {partner.phoneNumber ? `(${partner.phoneNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(order.status === "ASSIGNED" || order.status === "OUT_FOR_DELIVERY" || order.status === "PICKED_UP") && (
                <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
                  <Truck className="h-4 w-4" />
                  <span>
                    Assigned to: {
                      selectedDeliveryPartner[order.orderId]?.name || 
                      deliveryPartners.find(p => p.partnerId === order.deliveryPersonId)?.name || 
                      `Delivery Partner`
                    }
                  </span>
                  {order.deliveryPersonId && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                  )}
                </div>
              )}

              {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Order Delivered Successfully</span>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOrderModal(true);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 w-full sm:w-auto flex items-center justify-center gap-1"
              >
                <Eye size={14} />
                View Details
              </button>

              {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                <button
                  onClick={() => updateOrderStatus(order.orderId, "CANCELLED")}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 w-full sm:w-auto"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PREPARING", label: "Preparing" },
    { value: "READY_FOR_DELIVERY", label: "Ready" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 text-sm">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Today's Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="blue"
          description={formatDisplayDate(dateFilter)}
        />
        <StatCard
          title="To Prepare"
          value={stats.pendingOrders}
          icon={Clock}
          color="orange"
          description="Needs attention"
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          description="Today's amount"
        />
        <StatCard
          title="Active Subs"
          value={stats.activeSubscriptions}
          icon={Users}
          color="purple"
          description="Meal plans"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
        <TabButton
          label="Today's Orders"
          active={activeTab === "today"}
          onClick={() => setActiveTab("today")}
          count={orders.filter(order => 
            ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY"].includes(order.status)
          ).length}
        />
        <TabButton
          label="Assigned"
          active={activeTab === "assigned"}
          onClick={() => setActiveTab("assigned")}
          count={orders.filter(order => 
            ["ASSIGNED", "OUT_FOR_DELIVERY", "PICKED_UP", "ARRIVED"].includes(order.status)
          ).length}
        />
        <TabButton
          label="Delivered"
          active={activeTab === "delivered"}
          onClick={() => setActiveTab("delivered")}
          count={orders.filter(order => 
            ["DELIVERED", "COMPLETED"].includes(order.status)
          ).length}
        />
        <TabButton
          label="Upcoming"
          active={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
          count={upcomingOrders.length}
        />
        <TabButton
          label="Cancelled"
          active={activeTab === "cancelled"}
          onClick={() => setActiveTab("cancelled")}
          count={orders.filter(order => 
            ["CANCELLED", "FAILED"].includes(order.status)
          ).length}
        />
      </div>

      {/* Tab Content */}
      <div>
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : 
        
        /* Empty State */
        filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            {activeTab === "today" && (
              <>
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders to prepare</h3>
                <p className="text-gray-500">No orders for {formatDisplayDate(dateFilter)}</p>
              </>
            )}
            {activeTab === "assigned" && (
              <>
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned orders</h3>
                <p className="text-gray-500">No orders are currently assigned to delivery partners</p>
              </>
            )}
            {activeTab === "delivered" && (
              <>
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No delivered orders</h3>
                <p className="text-gray-500">No orders have been delivered yet</p>
              </>
            )}
            {activeTab === "upcoming" && (
              <>
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming orders</h3>
                <p className="text-gray-500">No upcoming orders for the next 7 days</p>
              </>
            )}
            {activeTab === "cancelled" && (
              <>
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled orders</h3>
                <p className="text-gray-500">No orders have been cancelled</p>
              </>
            )}
          </div>
        ) : 
        
        /* Orders List */
        (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.orderId} 
                order={order} 
                showActions={activeTab !== "delivered" && activeTab !== "cancelled" && activeTab !== "upcoming"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-2xl sm:max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order #{selectedOrder.orderId} Details</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedOrder.customer?.userName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedOrder.customer?.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.customer?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Status</p>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Order Details */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Order Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Date</p>
                    <p className="font-medium">{selectedOrder.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Time</p>
                    <p className="font-medium">{selectedOrder.preferredDeliveryTime || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold text-green-600">₹ {selectedOrder.totalAmount || 0}</p>
                  </div>
                </div>
              </div>
              
              {/* Delivery Address */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Delivery Address</h4>
                <p className="text-sm text-gray-700">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.landmark && (
                  <p className="text-sm text-gray-600 mt-1">Landmark: {selectedOrder.landmark}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;