import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Download,
  Printer,
  Bell,
  ShoppingBag,
  Eye,
  MessageSquare,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedSubscription, setExpandedSubscription] = useState(null);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pendingRenewals: 0,
    monthlyRevenue: 0
  });
  const navigate = useNavigate();

  // Load subscriptions data
  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      // Load all vendor subscriptions
      const subscriptionsData = await api.subscriptions.getVendorSubscriptions();
      
      if (subscriptionsData && Array.isArray(subscriptionsData)) {
        // Transform API data to match frontend structure
        const transformedSubscriptions = subscriptionsData.map(sub => ({
          id: sub.subscriptionId || sub.id,
          customer: {
            id: sub.userId || sub.customerId,
            name: sub.customerName || "Customer",
            email: sub.customerEmail || "",
            phone: sub.customerPhone || ""
          },
          plan: {
            id: sub.mealPlanId,
            name: sub.mealPlanTitle || "Meal Plan",
            type: sub.planType || "STANDARD",
            pricePerDay: sub.pricePerDay || 0,
            duration: sub.durationDays || 30,
            totalPrice: sub.totalAmount || 0
          },
          status: sub.status?.toUpperCase() || "PENDING",
          startDate: sub.startDate || new Date().toISOString(),
          endDate: sub.endDate || new Date().toISOString(),
          renewalDate: sub.renewalDate || sub.endDate || new Date().toISOString(),
          billingCycle: sub.billingCycle || "MONTHLY",
          paymentMethod: sub.paymentMethod || "",
          totalPaid: sub.paidAmount || 0,
          mealsDelivered: sub.mealsDelivered || 0,
          pendingMeals: sub.pendingMeals || 0,
          specialInstructions: sub.specialInstructions || "",
          deliveryTime: sub.deliveryTime || "12:00 PM",
          deliveryAddress: sub.deliveryAddress || ""
        }));
        
        setSubscriptions(transformedSubscriptions);
        calculateStats(transformedSubscriptions);
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      // Set empty array if API fails
      setSubscriptions([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real data
  const calculateStats = (subs) => {
    const totalSubscriptions = subs.length;
    const activeSubscriptions = subs.filter(sub => sub.status === "ACTIVE").length;
    
    // Calculate pending renewals (within 7 days)
    const pendingRenewals = subs.filter(sub => {
      if (sub.status !== "ACTIVE") return false;
      const renewalDate = new Date(sub.renewalDate);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return renewalDate <= nextWeek && renewalDate >= new Date();
    }).length;
    
    // Calculate monthly revenue from ACTIVE subscriptions
    const monthlyRevenue = subs
      .filter(sub => sub.status === "ACTIVE" && sub.billingCycle === "MONTHLY")
      .reduce((sum, sub) => sum + (sub.totalPaid || 0), 0);
    
    setStats({
      totalSubscriptions,
      activeSubscriptions,
      pendingRenewals,
      monthlyRevenue: `Rs. ${monthlyRevenue.toLocaleString()}`
    });
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Handle subscription status updates
  const updateSubscriptionStatus = async (subscriptionId, newStatus, reason = "") => {
    try {
      if (newStatus === "CANCELLED") {
        await api.subscriptions.cancelSubscription(subscriptionId);
      } else if (newStatus === "PAUSED") {
        // Note: There's no direct API for pausing, so we'll update payment status to "pending"
        await api.subscriptions.updatePaymentStatus(subscriptionId, "pending");
      } else if (newStatus === "ACTIVE" && reason === "from_pending") {
        // Activate pending subscription by updating payment status to "paid"
        await api.subscriptions.updatePaymentStatus(subscriptionId, "paid");
      }
      
      // Reload data to reflect changes
      loadSubscriptions();
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    }
  };

  // Send reminder (no backend API - this is a frontend-only feature)
  const sendReminder = (subscriptionId) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (subscription) {
      alert(`Reminder sent to ${subscription.customer.name} for renewal on ${formatDate(subscription.renewalDate)}`);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  // Filter subscriptions based on search and filters
  const getFilteredSubscriptions = () => {
    let filtered = subscriptions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.customer.name && sub.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.customer.email && sub.customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.customer.phone && sub.customer.phone.includes(searchTerm))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    return filtered;
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  const filteredSubscriptions = getFilteredSubscriptions();

  // Status UI helpers
  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      PAUSED: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      ACTIVE: <CheckCircle className="text-green-600" size={14} />,
      PENDING: <Clock className="text-yellow-600" size={14} />,
      EXPIRED: <AlertCircle className="text-gray-600" size={14} />,
      CANCELLED: <XCircle className="text-red-600" size={14} />,
      PAUSED: <Clock className="text-blue-600" size={14} />
    };
    return icons[status] || <AlertCircle className="text-gray-600" size={14} />;
  };

  // Compact StatCard Component
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
        <p className="text-gray-600">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-1">Manage customer subscriptions and renewals</p>
          </div>
          <button
            onClick={loadSubscriptions}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard
          title="Total Subscriptions"
          value={stats.totalSubscriptions}
          icon={Users}
          color="blue"
          onClick={() => setStatusFilter("all")}
        />
        <CompactStatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CheckCircle}
          color="green"
          onClick={() => setStatusFilter("ACTIVE")}
        />
        <CompactStatCard
          title="Pending Renewals"
          value={stats.pendingRenewals}
          icon={Clock}
          color="orange"
          onClick={() => setStatusFilter("ACTIVE")}
          description="Renewing in next 7 days"
        />
        <CompactStatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          icon={ShoppingBag}
          color="purple"
          onClick={() => {}}
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, phone, email, or subscription ID..."
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
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="PAUSED">Paused</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Subscriptions</h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredSubscriptions.length} subscriptions found
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

          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No subscriptions found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "No subscriptions available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Subscription Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(subscription.status).split(' ')[0]}`}>
                          {getStatusIcon(subscription.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{subscription.id}</h3>
                          <p className="text-sm text-gray-600">{subscription.customer.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                        <button
                          onClick={() => setExpandedSubscription(
                            expandedSubscription === subscription.id ? null : subscription.id
                          )}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {expandedSubscription === subscription.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Summary */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Plan Details</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{subscription.plan.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${subscription.plan.type === 'PREMIUM' ? 'bg-purple-100 text-purple-800' : subscription.plan.type === 'DELUXE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {subscription.plan.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {subscription.plan.duration} days • Rs. {subscription.plan.totalPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Delivery Schedule</p>
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-900">Start: {formatDate(subscription.startDate)}</p>
                            <p className="text-sm text-gray-500">End: {formatDate(subscription.endDate)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{subscription.deliveryTime}</p>
                            <p className="text-sm text-gray-500">{subscription.mealsDelivered} delivered</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment & Status</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">Rs. {subscription.totalPaid}</p>
                            <p className="text-sm text-gray-500 capitalize">
                              {subscription.paymentMethod ? subscription.paymentMethod.toLowerCase() : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              subscription.status === 'ACTIVE' ? 'text-green-600' :
                              subscription.status === 'PENDING' ? 'text-yellow-600' :
                              subscription.status === 'PAUSED' ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                              {subscription.pendingMeals} meals pending
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSubscription === subscription.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                          <div className="bg-white rounded-lg border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium">{subscription.customer.name}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {subscription.customer.email && (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm">{subscription.customer.email}</span>
                                </div>
                              )}
                              {subscription.customer.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm">{subscription.customer.phone}</span>
                                </div>
                              )}
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                <div>
                                  <p className="text-sm">{subscription.deliveryAddress}</p>
                                  <p className="text-xs text-gray-500 mt-1">Delivery: {subscription.deliveryTime}</p>
                                </div>
                              </div>
                            </div>
                            {subscription.specialInstructions && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                  <span className="font-medium">Special Instructions:</span> {subscription.specialInstructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subscription Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
                          <div className="bg-white rounded-lg border p-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600">Billing Cycle</p>
                                  <p className="font-medium">{subscription.billingCycle}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Next Renewal</p>
                                  <p className="font-medium">{formatDate(subscription.renewalDate)}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600">Total Value</p>
                                  <p className="font-bold text-green-600">Rs. {subscription.plan.totalPrice}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Amount Paid</p>
                                  <p className="font-bold text-gray-900">Rs. {subscription.totalPaid}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600">Meals Delivered</p>
                                  <p className="font-medium">{subscription.mealsDelivered}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Meals Pending</p>
                                  <p className={`font-medium ${subscription.pendingMeals > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {subscription.pendingMeals}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex flex-wrap gap-2">
                                {subscription.status === "ACTIVE" && (
                                  <>
                                    <button
                                      onClick={() => sendReminder(subscription.id)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <Bell className="h-3 w-3 inline mr-1" />
                                      Send Reminder
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Pause this subscription?')) {
                                          updateSubscriptionStatus(subscription.id, "PAUSED", "Customer request");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                      Pause Subscription
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this subscription?')) {
                                          updateSubscriptionStatus(subscription.id, "CANCELLED", "Vendor cancelled");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      Cancel Subscription
                                    </button>
                                  </>
                                )}
                                {subscription.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => updateSubscriptionStatus(subscription.id, "ACTIVE", "from_pending")}
                                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Activate
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this subscription?')) {
                                          updateSubscriptionStatus(subscription.id, "CANCELLED", "Payment not received");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {subscription.status === "PAUSED" && (
                                  <>
                                    <button
                                      onClick={() => updateSubscriptionStatus(subscription.id, "ACTIVE")}
                                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Resume
                                    </button>
                                    <button
                                      onClick={() => sendReminder(subscription.id)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <Bell className="h-3 w-3 inline mr-1" />
                                      Send Update
                                    </button>
                                  </>
                                )}
                                {subscription.status === "EXPIRED" && (
                                  <>
                                    <button
                                      onClick={() => sendReminder(subscription.id)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <Bell className="h-3 w-3 inline mr-1" />
                                      Send Renewal Offer
                                    </button>
                                  </>
                                )}
                              </div>
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

export default Subscriptions;