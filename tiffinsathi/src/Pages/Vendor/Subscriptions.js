// src/Pages/Vendor/Subscriptions.js
import React, { useState, useEffect, useMemo } from "react";
import { vendorApi } from "../../helpers/api";
import {
  Search,
  Filter,
  Package,
  User,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCw,
  X,
  Mail,
  Phone,
  Truck,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Shield,
  CalendarDays
} from "lucide-react";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError("");
    try {
      // Always fetch all subscriptions, we'll filter locally
      const response = await vendorApi.getVendorSubscriptions("ALL");
      
      if (response.ok && response.data) {
        const subs = Array.isArray(response.data) ? response.data : [];
        
        // Update status to COMPLETED if end date has passed
        const updatedSubs = subs.map(sub => {
          const remainingDays = getRemainingDays(sub.endDate);
          const isCompleted = remainingDays === 0 && sub.status === "ACTIVE";
          
          return {
            ...sub,
            displayStatus: isCompleted ? "COMPLETED" : sub.status,
            isCompletedByDate: isCompleted
          };
        });
        
        setSubscriptions(updatedSubs);
      } else {
        setError("Failed to load subscriptions");
        setSubscriptions([]);
        setFilteredSubscriptions([]);
      }
    } catch (err) {
      console.error("Error loading subscriptions:", err);
      setError("Error loading subscriptions: " + err.message);
      setSubscriptions([]);
      setFilteredSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];
    
    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (s) => s.displayStatus === statusFilter
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.customer?.userName && s.customer.userName.toLowerCase().includes(term)) ||
          (s.packageName && s.packageName.toLowerCase().includes(term)) ||
          (s.customer?.email && s.customer.email.toLowerCase().includes(term)) ||
          (s.subscriptionId && s.subscriptionId.toString().toLowerCase().includes(term)) ||
          (s.customer?.phoneNumber && s.customer.phoneNumber.includes(searchTerm))
      );
    }

    setFilteredSubscriptions(filtered);
  };

  // Calculate status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: subscriptions.length,
      ACTIVE: 0,
      PAUSED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
      PENDING: 0
    };
    
    subscriptions.forEach(sub => {
      const status = sub.displayStatus || sub.status;
      if (status in counts) {
        counts[status]++;
      }
    });
    
    return counts;
  }, [subscriptions]);

  const statusTabs = [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAUSED", label: "Paused" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PENDING", label: "Pending" }
  ];

  const handlePauseResume = async (subscription) => {
    if (subscription.displayStatus === "CANCELLED" || subscription.displayStatus === "COMPLETED") return;
    
    setActionLoading(subscription.subscriptionId);
    try {
      let response;
      if (subscription.displayStatus === "PAUSED") {
        response = await vendorApi.resumeSubscription(subscription.subscriptionId);
      } else {
        response = await vendorApi.pauseSubscription(subscription.subscriptionId, "Paused by vendor");
      }
      
      if (response.ok) {
        await loadSubscriptions();
      } else {
        setError("Failed to update subscription status");
      }
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError("Error updating subscription: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (subscription) => {
    if (!window.confirm(`Cancel subscription #${subscription.subscriptionId}? This cannot be undone.`)) {
      return;
    }
    
    setActionLoading(subscription.subscriptionId);
    try {
      const response = await vendorApi.cancelSubscription(
        subscription.subscriptionId,
        "Cancelled by vendor"
      );
      
      if (response.ok) {
        await loadSubscriptions();
      } else {
        setError("Failed to cancel subscription");
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError("Error cancelling subscription: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleCardExpansion = (subscriptionId) => {
    setExpandedCards(prev => ({
      ...prev,
      [subscriptionId]: !prev[subscriptionId]
    }));
  };

  const viewSubscriptionDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      PAUSED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      PENDING: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-NP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
    return `Rs. ${formatted}`;
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
          <p className="text-gray-600">Manage customer meal plan subscriptions</p>
        </div>
        
        <button
          onClick={loadSubscriptions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-700 hover:text-red-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4">
          {/* Top row with Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by customer name, email, phone, or subscription ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <Filter size={16} className="text-gray-400" />
              <select
                className="bg-transparent text-sm focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusTabs.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  statusFilter === tab.value
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {statusCounts[tab.value] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase() + ' '}subscriptions found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm 
              ? "No subscriptions match your search criteria" 
              : "Once customers subscribe to your meal plans, their subscriptions will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => {
            const remainingDays = getRemainingDays(subscription.endDate);
            const isExpanded = expandedCards[subscription.subscriptionId];
            const displayStatus = subscription.displayStatus || subscription.status;
            
            return (
              <div
                key={subscription.subscriptionId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Subscription Header */}
                <div 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleCardExpansion(subscription.subscriptionId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          #{subscription.subscriptionId}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            displayStatus
                          )}`}
                        >
                          {displayStatus}
                        </span>
                        {remainingDays !== null && displayStatus === 'ACTIVE' && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {remainingDays} days remaining
                          </span>
                        )}
                        {displayStatus === 'COMPLETED' && subscription.isCompletedByDate && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                            Completed (End date passed)
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{subscription.customer?.userName || "Customer"}</p>
                            <p className="text-sm text-gray-500">{subscription.customer?.phoneNumber || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{subscription.packageName || "Meal Package"}</p>
                            <p className="text-sm text-gray-500">{subscription.billingCycle || "Monthly"}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(subscription.totalAmount || subscription.packagePrice)}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Customer Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Customer Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{subscription.customer?.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{subscription.customer?.phoneNumber || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Customer ID: {subscription.customer?.userId || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Delivery Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Address</p>
                                <p className="text-sm text-gray-600">{subscription.deliveryAddress || "N/A"}</p>
                                {subscription.landmark && (
                                  <p className="text-sm text-gray-500">Landmark: {subscription.landmark}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Delivery Time: {subscription.preferredDeliveryTime || "Flexible"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Payment Info */}
                        {subscription.payment && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Payment Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Status</p>
                                <p className={`font-medium ${
                                  subscription.payment.paymentStatus === 'COMPLETED' 
                                    ? 'text-green-600' 
                                    : 'text-yellow-600'
                                }`}>
                                  {subscription.payment.paymentStatus}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Method</p>
                                <p className="font-medium">{subscription.payment.paymentMethod || "CARD"}</p>
                              </div>
                              {subscription.payment.transactionId && (
                                <div className="col-span-2">
                                  <p className="text-gray-600">Transaction ID</p>
                                  <p className="font-medium font-mono text-xs">{subscription.payment.transactionId}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Special Instructions */}
                        {(subscription.dietaryNotes || subscription.specialInstructions) && (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Special Instructions
                            </h4>
                            {subscription.dietaryNotes && (
                              <p className="text-sm text-yellow-800 mb-2">
                                <span className="font-medium">Dietary:</span> {subscription.dietaryNotes}
                              </p>
                            )}
                            {subscription.specialInstructions && (
                              <p className="text-sm text-yellow-800">
                                <span className="font-medium">Instructions:</span> {subscription.specialInstructions}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Subscription Timeline
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-sm font-medium text-blue-600">Started</div>
                              <div className="text-xs text-gray-600">{formatDate(subscription.startDate)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-blue-600">Ends</div>
                              <div className="text-xs text-gray-600">{formatDate(subscription.endDate)}</div>
                            </div>
                            {subscription.nextBillingDate && (
                              <div className="text-center">
                                <div className="text-sm font-medium text-blue-600">Next Billing</div>
                                <div className="text-xs text-gray-600">{formatDate(subscription.nextBillingDate)}</div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-sm font-medium text-blue-600">Status</div>
                              <div className="text-xs text-gray-600">{displayStatus}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                      <button
                        onClick={() => viewSubscriptionDetails(subscription)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Full Details
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePauseResume(subscription)}
                          disabled={displayStatus === "CANCELLED" || 
                                   displayStatus === "COMPLETED" ||
                                   actionLoading === subscription.subscriptionId}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                            displayStatus === "PAUSED"
                              ? "border-green-500 text-green-700 hover:bg-green-50"
                              : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2`}
                        >
                          {displayStatus === "PAUSED" ? "Resume" : "Pause"}
                        </button>
                        <button
                          onClick={() => handleCancel(subscription)}
                          disabled={displayStatus === "CANCELLED" || 
                                   displayStatus === "COMPLETED" ||
                                   actionLoading === subscription.subscriptionId}
                          className="px-4 py-2 rounded-lg text-sm font-medium border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          Cancel Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Subscription #{selectedSubscription.subscriptionId}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Complete subscription details</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Customer</div>
                  <div className="font-semibold text-gray-900">{selectedSubscription.customer?.userName || "N/A"}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubscription.displayStatus || selectedSubscription.status)}`}>
                    {selectedSubscription.displayStatus || selectedSubscription.status}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(selectedSubscription.totalAmount || selectedSubscription.packagePrice)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer and Package Info */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Customer Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Full Name</div>
                        <div className="font-medium">{selectedSubscription.customer?.userName || "N/A"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="font-medium">{selectedSubscription.customer?.phoneNumber || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="font-medium">{selectedSubscription.customer?.email || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Package Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Package Name</div>
                        <div className="font-medium">{selectedSubscription.packageName || "N/A"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Billing Cycle</div>
                          <div className="font-medium">{selectedSubscription.billingCycle || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Package Price</div>
                          <div className="font-medium">{formatCurrency(selectedSubscription.packagePrice)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery and Payment Info */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-orange-600" />
                      Delivery Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Delivery Address</div>
                        <div className="font-medium">{selectedSubscription.deliveryAddress || "N/A"}</div>
                      </div>
                      {selectedSubscription.landmark && (
                        <div>
                          <div className="text-sm text-gray-600">Landmark</div>
                          <div className="font-medium">{selectedSubscription.landmark}</div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Delivery Time</div>
                          <div className="font-medium">{selectedSubscription.preferredDeliveryTime || "Flexible"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Days Remaining</div>
                          <div className="font-medium text-blue-600">{getRemainingDays(selectedSubscription.endDate) || 0} days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;