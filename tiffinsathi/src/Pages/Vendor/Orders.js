// src/Pages/Vendor/Orders.js
import React, { useState, useEffect } from "react";
import { readData } from "../../helpers/storage";
import { 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Phone,
  User,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Download,
  RefreshCw,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  X
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, dateFilter, orders]);

  const loadData = () => {
    const data = readData();
    setOrders(data.orders || []);
    setDeliveryPartners(data.deliveryPartners || []);
    
    // Simulate upcoming orders (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcoming = (data.orders || []).filter(order => {
      const orderDate = new Date(order.deliveryDate || order.createdAt);
      return orderDate > today && orderDate <= nextWeek;
    });
    setUpcomingOrders(upcoming);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.items && order.items.some(item => 
          item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.id && order.id.toString().includes(searchTerm))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === dateFilter;
      });
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredOrders(filtered);
  };

  // Enhanced status workflow
  const updateOrderStatus = async (orderId, newStatus, deliveryPersonId = null) => {
    setLoading(true);
    
    const data = readData();
    const updatedOrders = data.orders.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, status: newStatus };
        if (deliveryPersonId) {
          updated.deliveryPartnerId = deliveryPersonId;
        }
        return updated;
      }
      return order;
    });
    
    data.orders = updatedOrders;
    // writeData(data); // Uncomment when you have writeData function
    
    setOrders(updatedOrders);
    
    // If delivery partner assigned, update their status
    if (deliveryPersonId && newStatus === "assigned") {
      const partner = deliveryPartners.find(p => p.id === deliveryPersonId);
      setSelectedDeliveryPartner(prev => ({
        ...prev,
        [orderId]: partner
      }));
    }
    
    setLoading(false);
  };

  const assignDeliveryPartner = (orderId, partnerId) => {
    if (!partnerId) {
      alert("Please select a delivery partner");
      return;
    }

    const partner = deliveryPartners.find(p => p.id === partnerId);
    setSelectedDeliveryPartner(prev => ({
      ...prev,
      [orderId]: partner
    }));

    updateOrderStatus(orderId, "assigned", partnerId);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      ready_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      assigned: "bg-indigo-100 text-indigo-800 border-indigo-200",
      out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      picked_up: "bg-blue-100 text-blue-800 border-blue-200",
      arrived: "bg-teal-100 text-teal-800 border-teal-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      failed: "bg-gray-100 text-gray-800 border-gray-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="text-yellow-600" size={16} />,
      preparing: <Clock className="text-blue-600" size={16} />,
      ready_for_delivery: <Package className="text-purple-600" size={16} />,
      assigned: <Truck className="text-indigo-600" size={16} />,
      out_for_delivery: <Truck className="text-purple-600" size={16} />,
      picked_up: <Truck className="text-blue-600" size={16} />,
      arrived: <CheckCircle className="text-teal-600" size={16} />,
      delivered: <CheckCircle className="text-green-600" size={16} />,
      cancelled: <XCircle className="text-red-600" size={16} />,
      confirmed: <CheckCircle className="text-blue-600" size={16} />
    };
    return icons[status];
  };

  const orderCountByStatus = (status) => 
    filteredOrders.filter(order => order.status === status).length;

  const allStatuses = [...new Set(orders.map(order => order.status))];

  const getAvailableDeliveryPartners = () => {
    return deliveryPartners.filter(partner => partner.status === "available" || partner.isActive);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Enhanced OrderCard component
  const OrderCard = ({ order, showActions = true }) => {
    const isExpanded = expandedOrders[order.id];
    
    return (
      <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Order #{order.id}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Customer: {order.userName || "N/A"} • 
              Phone: {order.phone || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Delivery: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"} at {order.deliveryTime || "N/A"}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Meals</h4>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} ({item.type || "Regular"})
                </span>
                <span className="font-medium">Qty: {item.quantity || item.qty || 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Address:</strong> {order.address}
          </p>
        </div>

        {order.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Instructions:</strong> {order.specialInstructions}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 flex-wrap">
            {order.status === "pending" && (
              <button
                onClick={() => updateOrderStatus(order.id, "confirmed")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Confirm Order
              </button>
            )}

            {order.status === "confirmed" && (
              <button
                onClick={() => updateOrderStatus(order.id, "preparing")}
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
              >
                Start Preparing
              </button>
            )}

            {order.status === "preparing" && (
              <button
                onClick={() => updateOrderStatus(order.id, "ready_for_delivery")}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
              >
                Mark Ready
              </button>
            )}

            {order.status === "ready_for_delivery" && (
              <div className="flex gap-2 items-center w-full">
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                  onChange={(e) => assignDeliveryPartner(order.id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select Delivery Partner</option>
                  {getAvailableDeliveryPartners().map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} {partner.phone ? `(${partner.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(order.status === "assigned" || order.status === "out_for_delivery") && (
              <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
                <Truck className="h-4 w-4" />
                <span>
                  Assigned to: {
                    selectedDeliveryPartner[order.id]?.name || 
                    deliveryPartners.find(p => p.id === order.deliveryPartnerId)?.name || 
                    `Delivery Partner`
                  }
                </span>
                {order.deliveryPartnerId && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                )}
              </div>
            )}

            {(order.status === "delivered" || order.status === "completed") && (
              <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Order Delivered Successfully</span>
              </div>
            )}

            {(order.status === "pending" || order.status === "confirmed") && (
              <button
                onClick={() => updateOrderStatus(order.id, "cancelled")}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={() => toggleOrderExpand(order.id)}
              className="ml-auto text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-gray-700">Order ID:</strong> {order.id}
              </div>
              <div>
                <strong className="text-gray-700">Payment:</strong> {order.paymentMethod || "Cash on Delivery"}
              </div>
              <div>
                <strong className="text-gray-700">Order Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}
              </div>
              <div>
                <strong className="text-gray-700">Total Amount:</strong> Rs {order.total}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready_for_delivery", label: "Ready for Delivery" },
    { value: "assigned", label: "Assigned" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {allStatuses.map((status) => (
          <div key={status} className="bg-white p-4 rounded-lg border text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{orderCountByStatus(status)}</div>
            <div className={`text-xs uppercase mt-1 px-2 py-1 rounded-full ${getStatusColor(status)}`}>
              {status.replace(/_/g, ' ')}
            </div>
          </div>
        ))}
        {allStatuses.length === 0 && (
          <div className="col-span-6 text-center py-4 text-gray-500">
            No orders found for selected date
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter size={16} className="mr-2" />
            <span>{filteredOrders.length} orders found</span>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setDateFilter(new Date().toISOString().split("T")[0]);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Today's Orders */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Today's Orders ({new Date(dateFilter).toLocaleDateString()})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">No orders for selected date</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} showActions={true} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Orders */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Upcoming Orders (Next 7 Days)
          </h3>
        </div>

        {upcomingOrders.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center shadow-sm">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming orders for the next 7 days.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingOrders.map((order) => (
              <OrderCard key={order.id} order={order} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;