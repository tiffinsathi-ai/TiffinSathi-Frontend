// src/Pages/Vendor/Subscriptions.js
import React, { useState, useEffect } from "react";
import { readData } from "../../helpers/storage";
import {
  Search,
  Filter,
  Package,
  User,
  Calendar,
  DollarSign,
  PauseCircle,
  PlayCircle,
  XCircle,
  TrendingUp,
  Clock,
  MapPin,
  Shield,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  X
} from "lucide-react";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter]);

  const loadSubscriptions = () => {
    setLoading(true);
    const data = readData();
    const subs = data.subscriptions || [];
    setSubscriptions(subs);
    setLoading(false);
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.userName && s.userName.toLowerCase().includes(term)) ||
          (s.planName && s.planName.toLowerCase().includes(term)) ||
          (s.tiffinName && s.tiffinName.toLowerCase().includes(term)) ||
          (s.userId && s.userId.toString().includes(term))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
  };

  const updateSubscriptionStatus = (id, newStatus) => {
    const data = readData();
    const subs = data.subscriptions || [];
    const updated = subs.map((s) =>
      s.id === id ? { ...s, status: newStatus } : s
    );
    data.subscriptions = updated;
    // writeData(data); // Uncomment when you have writeData function
    setSubscriptions(updated);
  };

  const handlePauseResume = (sub) => {
    if (sub.status === "cancelled") return;
    const nextStatus = sub.status === "paused" ? "active" : "paused";
    updateSubscriptionStatus(sub.id, nextStatus);
  };

  const handleCancel = (sub) => {
    if (!window.confirm("Cancel this subscription? This cannot be undone.")) {
      return;
    }
    updateSubscriptionStatus(sub.id, "cancelled");
  };

  const viewSubscriptionDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  };

  const getEstimatedCycles = (sub) => {
    if (!sub.totalBilled || !sub.pricePerCycle || sub.pricePerCycle <= 0) {
      return null;
    }
    return Math.round(sub.totalBilled / sub.pricePerCycle);
  };

  const statusOptions = [
    { value: "all", label: "All Subscriptions" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
          <p className="text-gray-600">Manage customer meal plan subscriptions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </span>
          <button
            onClick={loadSubscriptions}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by customer, plan, or tiffin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {statusFilter !== 'all' ? `${statusFilter} ` : ''}Subscriptions: {filteredSubscriptions.length}
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubscriptions.map((sub) => {
          const estimatedCycles = getEstimatedCycles(sub);
          return (
            <div
              key={sub.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Subscription #{sub.id}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Customer: {sub.userName || sub.customerName || 'N/A'} • 
                    Phone: {sub.customerPhone || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Period: {formatDate(sub.startDate)} -{" "}
                    {formatDate(sub.endDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total Amount: Rs. {sub.totalAmount || sub.totalBilled || 'N/A'}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    sub.status
                  )}`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <strong className="text-gray-700">Delivery Time:</strong>{" "}
                  {sub.deliveryTime || sub.preferredDeliveryTime || "N/A"}
                </div>
                <div>
                  <strong className="text-gray-700">Address:</strong>{" "}
                  {sub.deliveryAddress || sub.address || "N/A"}
                </div>
                {sub.landmark && (
                  <div>
                    <strong className="text-gray-700">Landmark:</strong>{" "}
                    {sub.landmark}
                  </div>
                )}
                {sub.dietaryNotes && (
                  <div className="md:col-span-2">
                    <strong className="text-gray-700">Dietary Notes:</strong>{" "}
                    <span className="text-yellow-700">{sub.dietaryNotes}</span>
                  </div>
                )}
                {sub.specialInstructions && (
                  <div className="md:col-span-2">
                    <strong className="text-gray-700">Special Instructions:</strong>{" "}
                    <span className="text-blue-700">{sub.specialInstructions}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <DollarSign size={14} className="mr-1" />
                  <span>Price: Rs {sub.pricePerCycle || 0} / {sub.billingCycle || "cycle"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <TrendingUp size={14} className="mr-1" />
                  <span>Billed: Rs {sub.totalBilled || 0}</span>
                </div>
              </div>

              {/* Payment Info */}
              {sub.paymentStatus && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <strong className="text-gray-700">Payment: </strong>
                  <span className={`${sub.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {sub.paymentStatus}
                  </span>
                  {sub.paymentMethod && ` • ${sub.paymentMethod}`}
                  {sub.transactionId && ` • Transaction: ${sub.transactionId}`}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => viewSubscriptionDetails(sub)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePauseResume(sub)}
                    disabled={sub.status === "cancelled" || sub.status === "completed"}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border ${
                      sub.status === "paused"
                        ? "border-green-500 text-green-700 hover:bg-green-50"
                        : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sub.status === "paused" ? (
                      <PlayCircle size={14} />
                    ) : (
                      <PauseCircle size={14} />
                    )}
                    <span>{sub.status === "paused" ? "Resume" : "Pause"}</span>
                  </button>
                  <button
                    onClick={() => handleCancel(sub)}
                    disabled={sub.status === "cancelled" || sub.status === "completed"}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={14} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {statusFilter === 'all' ? '' : statusFilter + ' '}Subscriptions Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Once customers subscribe to your meal plans, their subscriptions will appear here.
          </p>
        </div>
      )}

      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Subscription #{selectedSubscription.id} Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-medium">{selectedSubscription.userName || selectedSubscription.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium">{selectedSubscription.customerPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan Name</p>
                  <p className="font-medium">{selectedSubscription.planName || selectedSubscription.tiffinName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="font-medium">{selectedSubscription.billingCycle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Cycle</p>
                  <p className="font-medium">Rs {selectedSubscription.pricePerCycle || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Billed</p>
                  <p className="font-medium">Rs {selectedSubscription.totalBilled || 0}</p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">Delivery Information</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Address:</strong> {selectedSubscription.deliveryAddress || selectedSubscription.address || 'N/A'}
                  </p>
                  {selectedSubscription.landmark && (
                    <p className="text-sm">
                      <strong>Landmark:</strong> {selectedSubscription.landmark}
                    </p>
                  )}
                  <p className="text-sm">
                    <strong>Delivery Time:</strong> {selectedSubscription.deliveryTime || selectedSubscription.preferredDeliveryTime || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              {(selectedSubscription.dietaryNotes || selectedSubscription.specialInstructions) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Special Instructions</h4>
                  {selectedSubscription.dietaryNotes && (
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Dietary Notes:</strong> {selectedSubscription.dietaryNotes}
                    </p>
                  )}
                  {selectedSubscription.specialInstructions && (
                    <p className="text-sm text-gray-700">
                      <strong>Special Instructions:</strong> {selectedSubscription.specialInstructions}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Info */}
              {selectedSubscription.paymentStatus && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className={`font-medium ${
                        selectedSubscription.paymentStatus === 'paid' ? 'text-green-600' : 
                        selectedSubscription.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedSubscription.paymentStatus}
                      </p>
                    </div>
                    {selectedSubscription.paymentMethod && (
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium">{selectedSubscription.paymentMethod}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-gray-900 mb-3">Subscription Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Subscription Started</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedSubscription.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Next Billing Date</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedSubscription.nextBillingDate)}</p>
                    </div>
                  </div>
                  {selectedSubscription.endDate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedSubscription.endDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
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

export default Subscriptions;