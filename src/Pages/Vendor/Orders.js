// src/Pages/Vendor/Orders.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
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
  Package
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        order.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(order => 
            new Date(order.createdAt).toDateString() === today.toDateString()
          );
          break;
        case "week":
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          filtered = filtered.filter(order => 
            new Date(order.createdAt) >= weekAgo
          );
          break;
        case "month":
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          filtered = filtered.filter(order => 
            new Date(order.createdAt) >= monthAgo
          );
          break;
        default:
          break;
      }
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    
    const data = readData();
    const updatedOrders = data.orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    data.orders = updatedOrders;
    writeData(data);
    
    setOrders(updatedOrders);
    setLoading(false);
  };

  const assignDeliveryPartner = (orderId, partnerId) => {
    const data = readData();
    
    // Update order
    const updatedOrders = data.orders.map(order =>
      order.id === orderId 
        ? { 
            ...order, 
            deliveryPartnerId: partnerId, 
            status: "out_for_delivery" 
          }
        : order
    );
    
    // Update delivery partner status
    const updatedPartners = data.deliveryPartners.map(partner =>
      partner.id === partnerId 
        ? { ...partner, status: "busy" }
        : partner
    );
    
    data.orders = updatedOrders;
    data.deliveryPartners = updatedPartners;
    writeData(data);
    
    setOrders(updatedOrders);
    setDeliveryPartners(updatedPartners);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="text-yellow-600" size={16} />,
      preparing: <Clock className="text-blue-600" size={16} />,
      out_for_delivery: <Truck className="text-purple-600" size={16} />,
      delivered: <CheckCircle className="text-green-600" size={16} />,
      cancelled: <XCircle className="text-red-600" size={16} />
    };
    return icons[status];
  };

  const getAvailableDeliveryPartners = () => {
    return deliveryPartners.filter(partner => partner.status === "available");
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const exportOrders = () => {
    // Simple CSV export functionality
    const headers = ["Order ID", "Customer", "Items", "Total", "Status", "Date"];
    const csvData = filteredOrders.map(order => [
      order.id,
      order.userName,
      order.items.map(item => item.name).join("; "),
      `Rs ${order.total}`,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
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
            onClick={exportOrders}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
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
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter size={16} className="mr-2" />
            <span>{filteredOrders.length} orders found</span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.userName}</h3>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{getTimeAgo(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span className="max-w-xs truncate">{order.address}</span>
                      </div>
                      {order.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{order.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">Rs {order.total}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} × {item.qty || 1}
                        </span>
                        <span className="text-gray-900">Rs {item.price * (item.qty || 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Special Instructions</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">{order.specialInstructions}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-3 lg:w-64">
                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Delivery Partner Assignment */}
                {order.status === "preparing" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Delivery</label>
                    <select
                      value={order.deliveryPartnerId || ""}
                      onChange={(e) => assignDeliveryPartner(order.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select delivery partner</option>
                      {getAvailableDeliveryPartners().map(partner => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name} ({partner.vehicle || "Bike"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "No orders match your current filters. Try adjusting your search criteria."
                : "No orders have been placed yet. Orders will appear here when customers place them."
              }
            </p>
            {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-medium">{selectedOrder.userName}</p>
                    </div>
                    {selectedOrder.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">{selectedOrder.phone}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.qty || 1}</p>
                        </div>
                        <p className="font-bold">Rs {item.price * (item.qty || 1)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <p className="font-bold text-lg">Total</p>
                      <p className="font-bold text-lg">Rs {selectedOrder.total}</p>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        ["preparing", "out_for_delivery", "delivered"].includes(selectedOrder.status) 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">Order Confirmed</p>
                        <p className="text-xs text-gray-500">-</p>
                      </div>
                    </div>
                    {/* Add more timeline steps based on status */}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle order actions
                    setShowOrderModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;