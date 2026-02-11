import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  ShoppingBag,
  X,
  Eye,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  AlertCircle,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api"; // Import the API
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load orders, delivery partners, and active deliveries in parallel
      const [ordersResponse, partnersResponse, deliveriesResponse] = await Promise.all([
        api.orders.getTodayOrders(),
        api.deliveryPartners.getVendorDeliveryPartners(),
        api.orderDeliveries.getVendorActiveDeliveries()
      ]);

      // Transform orders data
      const transformedOrders = (ordersResponse || []).map(order => {
        // Map backend order status to frontend statuses
        const statusMap = {
          'PENDING': 'PENDING',
          'CONFIRMED': 'CONFIRMED',
          'PREPARING': 'PREPARING',
          'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
          'ASSIGNED': 'ASSIGNED',
          'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
          'DELIVERED': 'DELIVERED',
          'CANCELLED': 'CANCELLED'
        };

        // Find delivery info for this order
        const deliveryInfo = deliveriesResponse?.find(d => d.orderId === order.id) || {};
        const assignedPartner = partnersResponse?.find(p => p.id === deliveryInfo.deliveryPartnerId);

        return {
          id: order.id || order._id,
          orderNumber: order.orderNumber || `TS-${(order.id || '').slice(-5)}`,
          // Customer info might be limited in backend
          customer: {
            name: order.customerName || 'Customer',
            phone: order.customerPhone || 'Not provided',
            email: order.customerEmail || ''
          },
          items: order.items || [
            { 
              name: order.mealPlanName || 'Meal', 
              quantity: order.quantity || 1, 
              price: order.price || 0,
              total: (order.price || 0) * (order.quantity || 1)
            }
          ],
          totalAmount: order.totalAmount || order.price || 0,
          status: statusMap[order.status] || 'PENDING',
          deliveryAddress: order.deliveryAddress || 'Address not specified',
          landmark: order.landmark || '',
          orderTime: order.createdAt || new Date().toISOString(),
          deliveryTime: order.deliveryTime || '',
          paymentMethod: order.paymentMethod || 'Cash on Delivery',
          specialInstructions: order.specialInstructions || '',
          assignedTo: assignedPartner?.name || deliveryInfo.deliveryPartnerName || '',
          deliveryId: deliveryInfo.id,
          deliveryStatus: deliveryInfo.deliveryStatus
        };
      });

      // Transform delivery partners
      const transformedPartners = (partnersResponse || []).map(partner => ({
        id: partner.id || partner._id,
        name: partner.name || `Partner ${partner.id}`,
        phone: partner.phone || '',
        status: partner.status || 'active',
        rating: partner.rating || 4.0,
        assignedOrders: partner.assignedOrders || 0
      }));

      setOrders(transformedOrders);
      setDeliveryPartners(transformedPartners);
      setActiveDeliveries(deliveriesResponse || []);

      toast.success('Orders loaded successfully');
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load orders. Please try again.");
      toast.error('Failed to load orders');
      // Set empty arrays instead of mock data
      setOrders([]);
      setDeliveryPartners([]);
      setActiveDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REAL API OPERATIONS
  // ============================================

  const updateOrderStatus = async (orderId, newStatus, deliveryPartnerId = null) => {
    setError(null);
    
    try {
      // Handle different status changes
      if (newStatus === "CANCELLED") {
        await api.orders.cancelOrder(orderId);
        toast.success('Order cancelled successfully');
      } else if (newStatus === "ASSIGNED" && deliveryPartnerId) {
        // Assign delivery partner
        await api.orderDeliveries.assignDeliveryPartner(orderId, deliveryPartnerId);
        toast.success('Delivery partner assigned successfully');
      } else if (newStatus === "OUT_FOR_DELIVERY") {
        // Find delivery ID first
        const delivery = activeDeliveries.find(d => d.orderId === orderId);
        if (delivery?.id) {
          await api.orderDeliveries.updateDeliveryStatus(delivery.id, "OUT_FOR_DELIVERY");
          toast.success('Order marked as out for delivery');
        }
      } else if (newStatus === "DELIVERED") {
        const delivery = activeDeliveries.find(d => d.orderId === orderId);
        if (delivery?.id) {
          await api.orderDeliveries.updateDeliveryStatus(delivery.id, "DELIVERED");
          toast.success('Order marked as delivered');
        }
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus,
                assignedTo: deliveryPartnerId 
                  ? deliveryPartners.find(p => p.id === deliveryPartnerId)?.name 
                  : order.assignedTo
              } 
            : order
        )
      );
      
      // Refresh data to get updated delivery info
      loadData();
      
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message || "Failed to update order status");
      toast.error('Failed to update order status');
    }
  };

  // ============================================
  // LOCAL COMPONENT PATTERNS (UPDATED)
  // ============================================

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
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      PREPARING: "bg-orange-100 text-orange-800 border-orange-200",
      READY_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
      ASSIGNED: "bg-indigo-100 text-indigo-800 border-indigo-200",
      OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
      CANCELLED: <XCircle className="text-red-600" size={14} />
    };
    return icons[status] || <Package className="text-gray-600" size={14} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate stats from current data - REAL-TIME
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.orderTime.includes(today));
    const totalOrders = todayOrders.length;
    const pendingOrders = todayOrders.filter(order => order.status === "PENDING").length;
    
    // Calculate today's revenue from delivered, preparing, confirmed, and ready orders
    const todayRevenue = todayOrders
      .filter(order => ["DELIVERED", "PREPARING", "CONFIRMED", "READY_FOR_DELIVERY", "ASSIGNED", "OUT_FOR_DELIVERY"].includes(order.status))
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const deliveredToday = todayOrders.filter(order => order.status === "DELIVERED").length;

    return {
      totalOrders,
      pendingOrders,
      todayRevenue,
      deliveredToday
    };
  };

  const getFilteredOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter by active tab
    let filtered = orders;
    
    switch (activeTab) {
      case "today":
        filtered = orders.filter(order => 
          !["DELIVERED", "CANCELLED"].includes(order.status) && 
          order.orderTime.includes(today)
        );
        break;
      case "delivered":
        filtered = orders.filter(order => order.status === "DELIVERED" && order.orderTime.includes(today));
        break;
      case "cancelled":
        filtered = orders.filter(order => order.status === "CANCELLED" && order.orderTime.includes(today));
        break;
      default:
        filtered = orders.filter(order => order.orderTime.includes(today));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  };

  // Action buttons based on order status - LIMITED TO AVAILABLE APIS
  const renderActionButtons = (order) => {
    switch (order.status) {
      case "PENDING":
      case "CONFIRMED":
      case "PREPARING":
        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateOrderStatus(order.id, "CANCELLED")}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        );
      case "READY_FOR_DELIVERY":
        return (
          <div className="flex flex-wrap gap-2">
            <select
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => {
                const partnerId = parseInt(e.target.value);
                if (partnerId) {
                  updateOrderStatus(order.id, "ASSIGNED", partnerId);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select Delivery Partner</option>
              {deliveryPartners
                .filter(partner => partner.status === "active")
                .map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} ({partner.phone || 'No phone'})
                  </option>
                ))}
            </select>
          </div>
        );
      case "ASSIGNED":
        return (
          <button
            onClick={() => updateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            Mark Out for Delivery
          </button>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <button
            onClick={() => updateOrderStatus(order.id, "DELIVERED")}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
          >
            Mark as Delivered
          </button>
        );
      default:
        return null;
    }
  };

  const filteredOrders = getFilteredOrders();
  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track customer orders</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard
          title="Today's Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="blue"
          onClick={() => setActiveTab("today")}
        />
        <CompactStatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="orange"
          onClick={() => {
            setActiveTab("today");
            setStatusFilter("PENDING");
          }}
        />
        <CompactStatCard
          title="Today's Revenue"
          value={`Rs. ${stats.todayRevenue.toLocaleString()}`}
          icon={() => <span className="text-lg font-bold">Rs.</span>}
          color="green"
        />
        <CompactStatCard
          title="Delivered Today"
          value={stats.deliveredToday}
          icon={CheckCircle}
          color="purple"
          onClick={() => setActiveTab("delivered")}
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
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - REMOVED UPCOMING TAB */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-6">
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
                {orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status) && o.orderTime.includes(new Date().toISOString().split('T')[0])).length}
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
                {orders.filter(o => o.status === "DELIVERED" && o.orderTime.includes(new Date().toISOString().split('T')[0])).length}
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
                {orders.filter(o => o.status === "CANCELLED" && o.orderTime.includes(new Date().toISOString().split('T')[0])).length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "today" && "Today's Orders"}
                {activeTab === "delivered" && "Delivered Orders"}
                {activeTab === "cancelled" && "Cancelled Orders"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {filteredOrders.length} orders
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Printer size={18} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching orders found" : "No orders for this category"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "All caught up! No orders require attention."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status).split(' ')[0]}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {order.customer.name} • {order.customer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setExpandedOrder(expandedOrder === order.id ? null : order.id);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                        <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                        {order.landmark && <p className="text-sm text-gray-500">Landmark: {order.landmark}</p>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Details</p>
                        <p className="font-medium text-gray-900">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Amount & Time</p>
                        <p className="font-bold text-gray-900 text-lg">Rs. {order.totalAmount}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.orderTime)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {renderActionButtons(order)}
                        </div>
                      </div>
                    )}

                    {/* Assigned Delivery Partner */}
                    {order.assignedTo && (
                      <div className="mt-3 flex items-center text-sm text-gray-600">
                        <Truck className="h-4 w-4 mr-2" />
                        <span>Assigned to: <strong>{order.assignedTo}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Items Detail */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                          <div className="bg-white rounded-lg border">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
                                <div>
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-500">Rs. {item.price} each</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">Qty: {item.quantity}</p>
                                  <p className="text-xs text-gray-500">Total: Rs. {item.total}</p>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between items-center p-3 bg-gray-50">
                              <span className="font-bold">Total Amount</span>
                              <span className="font-bold text-green-600">Rs. {order.totalAmount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer & Delivery Info */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                            <div className="bg-white rounded-lg border p-4 space-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{order.customer.name}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{order.customer.phone}</span>
                              </div>
                              {order.customer.email && (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <span>{order.customer.email}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                            <div className="bg-white rounded-lg border p-4 space-y-2">
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                <div>
                                  <p className="text-sm">{order.deliveryAddress}</p>
                                  {order.landmark && <p className="text-xs text-gray-500">Landmark: {order.landmark}</p>}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Delivery Time</p>
                                  <p className="font-medium">{order.deliveryTime ? formatDate(order.deliveryTime) : 'Flexible'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Payment</p>
                                  <p className="font-medium">{order.paymentMethod}</p>
                                </div>
                              </div>
                              {order.specialInstructions && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                                  </p>
                                </div>
                              )}
                              {order.deliveryStatus && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">Delivery Status</p>
                                  <p className="font-medium">{order.deliveryStatus.replace(/_/g, ' ')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
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