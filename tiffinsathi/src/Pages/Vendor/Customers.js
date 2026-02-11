import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  MessageSquare,
  DollarSign,
  Package as PackageIcon,
  X,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Printer,
  MapPin,
  Star,
  Activity,
  ShoppingBag,
  Trash2
} from "lucide-react";

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    customerGrowth: 0,
    revenueGrowth: 0,
    repeatRate: 0
  });

  // Extract customers from subscriptions
  const extractCustomersFromSubscriptions = async () => {
    setLoading(true);
    try {
      // Get subscriptions to extract customer info
      const subscriptions = await api.subscriptions.getVendorSubscriptions();
      
      if (!subscriptions || !Array.isArray(subscriptions)) {
        setCustomers([]);
        calculateStats([]);
        return;
      }

      // Group subscriptions by customer
      const customerMap = new Map();
      
      subscriptions.forEach(sub => {
        const customerId = sub.userId || sub.customerId;
        if (!customerId) return;

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            userId: customerId,
            userName: sub.customerName || `Customer ${customerId}`,
            email: sub.customerEmail || "",
            phoneNumber: sub.customerPhone || "",
            profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.customerName || customerId)}&background=4F46E5&color=fff`,
            subscriptionCount: 0,
            activeSubscriptions: 0,
            totalSpent: 0,
            orders: [],
            subscriptions: [],
            lastOrderDate: null,
            joinDate: sub.startDate || new Date().toISOString()
          });
        }

        const customer = customerMap.get(customerId);
        customer.subscriptionCount++;
        customer.totalSpent += sub.paidAmount || 0;
        customer.subscriptions.push({
          id: sub.subscriptionId || sub.id,
          planName: sub.mealPlanTitle || "Meal Plan",
          status: sub.status?.toUpperCase() || "PENDING",
          startDate: sub.startDate,
          endDate: sub.endDate,
          price: sub.totalAmount || 0,
          billingCycle: sub.billingCycle || "MONTHLY"
        });

        if (sub.status === "ACTIVE") {
          customer.activeSubscriptions++;
        }

        // Update last order date
        if (sub.startDate && (!customer.lastOrderDate || new Date(sub.startDate) > new Date(customer.lastOrderDate))) {
          customer.lastOrderDate = sub.startDate;
        }
      });

      // Convert map to array and calculate status
      const customerArray = Array.from(customerMap.values()).map(customer => {
        let status = "inactive";
        if (customer.activeSubscriptions > 0) {
          status = "active";
        } else if (customer.subscriptionCount === 1 && customer.subscriptions[0]?.status === "PENDING") {
          status = "new";
        }

        return {
          ...customer,
          status,
          orderCount: customer.subscriptions.length,
          currentSubscription: customer.subscriptions.find(sub => sub.status === "ACTIVE") || null
        };
      });

      setCustomers(customerArray);
      calculateStats(customerArray);
    } catch (error) {
      console.error("Error loading customers:", error);
      setError("Failed to load customer data. Using demo data.");
      setCustomers([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    extractCustomersFromSubscriptions();
  }, []);

  // Calculate statistics
  const calculateStats = (customerList) => {
    const totalCustomers = customerList.length;
    const activeSubscriptions = customerList.reduce((sum, customer) => sum + customer.activeSubscriptions, 0);
    const totalRevenue = customerList.reduce((sum, customer) => sum + customer.totalSpent, 0);
    
    // Calculate repeat rate (customers with multiple subscriptions)
    const repeatCustomers = customerList.filter(customer => customer.subscriptionCount > 1).length;
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

    setStats({
      totalCustomers,
      activeSubscriptions,
      totalRevenue,
      repeatRate,
      customerGrowth: 0, // Not available from API
      revenueGrowth: 0   // Not available from API
    });
  };

  // Filter customers based on search and active tab
  useEffect(() => {
    let filtered = [...customers];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.userName?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.phoneNumber?.includes(searchTerm) ||
        customer.userId?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter(customer => customer.status === activeTab);
    }
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, activeTab]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${(amount || 0).toLocaleString('en-IN')}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    } catch {
      return "N/A";
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'new':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-800 border-green-200";
      case 'new':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'inactive':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Navigation functions
  const navigateToSubscriptions = () => {
    navigate('/vendor/subscriptions');
  };

  const navigateToAllCustomers = () => {
    setActiveTab("all");
    setSearchTerm("");
  };

  // Action handlers
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleSendMessage = () => {
    if (!selectedCustomer || !messageText.trim()) {
      setError("Please enter a message");
      return;
    }
    
    setActionLoading(selectedCustomer.userId);
    // Frontend-only feature - no backend API
    setTimeout(() => {
      alert(`Message sent to ${selectedCustomer.userName}: "${messageText}"`);
      setMessageText("");
      setShowMessageForm(false);
      setActionLoading(null);
    }, 1000);
  };

  const handleExportData = () => {
    const exportData = filteredCustomers.map(customer => ({
      customerId: customer.userId,
      name: customer.userName,
      email: customer.email,
      phone: customer.phoneNumber,
      totalSpent: customer.totalSpent,
      subscriptionCount: customer.subscriptionCount,
      activeSubscriptions: customer.activeSubscriptions,
      lastOrder: customer.lastOrderDate
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `customers-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  // Tabs configuration
  const tabs = [
    { id: "all", label: "All Customers", count: customers.length, icon: UsersIcon },
    { id: "active", label: "Active", count: customers.filter(c => c.status === "active").length, icon: CheckCircle },
    { id: "new", label: "New", count: customers.filter(c => c.status === "new").length, icon: Clock },
    { id: "inactive", label: "Inactive", count: customers.filter(c => c.status === "inactive").length, icon: XCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage customers from your subscriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={extractCustomersFromSubscriptions}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={UsersIcon}
          color="blue"
          onClick={navigateToAllCustomers}
        />
        <CompactStatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={PackageIcon}
          color="green"
          onClick={navigateToSubscriptions}
          description="Across all customers"
        />
        <CompactStatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={ShoppingBag}
          color="purple"
        />
        <CompactStatCard
          title="Repeat Rate"
          value={`${stats.repeatRate}%`}
          icon={Activity}
          color="orange"
          description="Customers with multiple subscriptions"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers by name, email or phone number..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    activeTab === tab.id ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab === 'all' ? '' : activeTab + ' '}customers found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm 
              ? "No customers match your search criteria" 
              : "No customers have subscribed yet. Customers will appear here when they subscribe to your meal plans."}
          </p>
          {(searchTerm || activeTab !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={customer.profilePicture}
                          alt={customer.userName}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {customer.userName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {customer.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[180px]">{customer.email}</span>
                          </div>
                        )}
                        {customer.phoneNumber && (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {customer.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {customer.subscriptionCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {customer.activeSubscriptions || 0}
                          </div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(customer.totalSpent || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        from {customer.subscriptionCount} subscription(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.lastOrderDate ? getTimeAgo(customer.lastOrderDate) : "No activity"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {formatDate(customer.joinDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(customer.status)}`}>
                          {getStatusIcon(customer.status)}
                          <span className="capitalize">{customer.status || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-2 px-3 py-1.5 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                          title="View customer details"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerModal(true);
                            setShowMessageForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                          title="Send message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of {customers.length} customers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportData}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-6xl rounded-xl shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
                  <p className="text-gray-600 mt-1">Customer ID: {selectedCustomer.userId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedCustomer(null);
                    setShowMessageForm(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex flex-col items-center">
                      <img
                        src={selectedCustomer.profilePicture}
                        alt={selectedCustomer.userName}
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-sm mb-4"
                      />
                      <h4 className="text-lg font-bold text-gray-900">{selectedCustomer.userName}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(selectedCustomer.status)}`}>
                          {getStatusIcon(selectedCustomer.status)}
                          <span className="capitalize">{selectedCustomer.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      {selectedCustomer.email && (
                        <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedCustomer.email}</span>
                        </div>
                      )}
                      {selectedCustomer.phoneNumber && (
                        <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedCustomer.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 p-3 hover:bg-white rounded-lg transition-colors border border-gray-200">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Joined {formatDate(selectedCustomer.joinDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCustomer.subscriptionCount || 0}
                      </div>
                      <div className="text-xs text-gray-600">Total Subscriptions</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCustomer.activeSubscriptions || 0}
                      </div>
                      <div className="text-xs text-gray-600">Active Subs</div>
                    </div>
                  </div>
                </div>

                {/* Right Columns - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Stats */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Customer Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(selectedCustomer.totalSpent || 0)}
                        </div>
                        <div className="text-xs text-gray-600">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {selectedCustomer.subscriptionCount || 0}
                        </div>
                        <div className="text-xs text-gray-600">Total Subs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {selectedCustomer.activeSubscriptions || 0}
                        </div>
                        <div className="text-xs text-gray-600">Active Subs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatDate(selectedCustomer.lastOrderDate)}
                        </div>
                        <div className="text-xs text-gray-600">Last Activity</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Subscription */}
                  {selectedCustomer.currentSubscription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Current Subscription
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Status</div>
                          <div className={`text-sm font-medium px-2 py-1 rounded inline-block ${
                            selectedCustomer.currentSubscription.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedCustomer.currentSubscription.status}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Plan</div>
                          <div className="text-sm font-medium">{selectedCustomer.currentSubscription.planName}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Billing</div>
                          <div className="text-sm font-medium">{selectedCustomer.currentSubscription.billingCycle}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Price</div>
                          <div className="text-sm font-medium">{formatCurrency(selectedCustomer.currentSubscription.price)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Form */}
                  {showMessageForm && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Send Message to {selectedCustomer.userName}
                      </h4>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={4}
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                      <div className="flex justify-end gap-3 mt-3">
                        <button
                          onClick={() => setShowMessageForm(false)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendMessage}
                          disabled={actionLoading === selectedCustomer.userId}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
                        >
                          {actionLoading === selectedCustomer.userId ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMessageForm(!showMessageForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {showMessageForm ? 'Hide Message Form' : 'Send Message'}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowCustomerModal(false);
                      setSelectedCustomer(null);
                      setShowMessageForm(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate(`/vendor/subscriptions?customer=${selectedCustomer.userId}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <PackageIcon className="h-4 w-4" />
                    View Subscriptions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;