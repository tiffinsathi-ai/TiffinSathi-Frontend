// src/Pages/Vendor/Customers.js
import React, { useState, useEffect, useCallback } from "react";
import { vendorApi } from "../../helpers/api";
import { 
  Search, 
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  Shield,
  DollarSign,
  Package as PackageIcon,
  X,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Memoize loadCustomers to fix the useEffect dependency warning
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vendorApi.getVendorCustomers(searchTerm);
      if (response.ok && Array.isArray(response.data)) {
        // Transform API data to match our component structure
        const enhancedCustomers = response.data.map(customer => {
          // Determine customer status based on their activity
          let status = "new";
          if (customer.totalOrders > 0) {
            status = "active";
          } else if (customer.userStatus === "INACTIVE") {
            status = "inactive";
          }

          return {
            id: customer.userId,
            name: customer.userName,
            email: customer.email,
            phone: customer.phoneNumber,
            profilePicture: customer.profilePicture,
            orderCount: customer.totalOrders || 0,
            subscriptionCount: customer.totalSubscriptions || 0,
            activeSubscriptions: customer.activeSubscriptions || 0,
            totalSpent: customer.totalSpent || 0,
            status: status,
            joinDate: customer.createdAt || customer.joinDate,
            dietaryNotes: customer.dietaryNotes,
            userStatus: customer.userStatus,
            currentSubscription: customer.currentSubscriptionId ? {
              id: customer.currentSubscriptionId,
              planName: customer.currentPackageName,
              status: customer.currentSubscriptionStatus,
              startDate: customer.currentSubscriptionStart,
              endDate: customer.currentSubscriptionEnd
            } : null
          };
        });
        setCustomers(enhancedCustomers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const filterCustomers = useCallback(() => {
    let filtered = [...customers];

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter(customer => customer.status === activeTab);
    }

    setFilteredCustomers(filtered);
  }, [customers, activeTab]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const viewCustomerDetails = async (customer) => {
    try {
      const response = await vendorApi.getCustomerDetails(customer.id);
      if (response.ok && response.data) {
        const customerData = response.data;
        
        // Transform API response to match our modal structure
        const enhancedCustomer = {
          ...customer,
          orders: customerData.orders || [],
          subscriptions: customerData.subscriptions || [],
          reviews: customerData.reviews || [],
          address: customerData.address,
          dietaryNotes: customerData.dietaryNotes,
          specialInstructions: customerData.specialInstructions,
          currentSubscription: customerData.currentSubscription || customer.currentSubscription
        };
        
        setSelectedCustomer(enhancedCustomer);
        setShowCustomerModal(true);
      } else {
        setSelectedCustomer(customer);
        setShowCustomerModal(true);
      }
    } catch (err) {
      console.error("Failed to load customer details:", err);
      setSelectedCustomer(customer);
      setShowCustomerModal(true);
    }
  };

  const handleSendMessage = () => {
    if (!selectedCustomer || !messageText.trim()) {
      alert("Please enter a message");
      return;
    }
    alert(`Message sent to ${selectedCustomer.name}: "${messageText.trim()}"`);
    setMessageText("");
    setShowMessageForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      emerald: "text-emerald-600 bg-emerald-50",
      purple: "text-purple-600 bg-purple-50"
    };

    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          {change && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    );
  };

  const tabs = [
    { id: "all", label: "All Customers", count: customers.length },
    { id: "active", label: "Active", count: customers.filter(c => c.status === "active").length },
    { id: "new", label: "New", count: customers.filter(c => c.status === "new").length },
    { id: "inactive", label: "Inactive", count: customers.filter(c => c.status === "inactive").length }
  ];

  return (
    <div className="space-y-6">
      {/* Header - Left Aligned */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">Manage all customers who have subscribed to your services</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadCustomers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Smaller */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={customers.length}
          icon={User}
          color="blue"
        />
        <StatCard
          title="Active Subscriptions"
          value={customers.reduce((sum, customer) => sum + (customer.activeSubscriptions || 0), 0)}
          icon={PackageIcon}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`Rs. ${customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0).toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Avg. Subscriptions"
          value={customers.length > 0 
            ? (customers.reduce((sum, customer) => sum + (customer.subscriptionCount || 0), 0) / customers.length).toFixed(1)
            : 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Single Search Bar without label */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers by name, email or phone number..."
                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  loadCustomers();
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Customer Table with Border */}
        <div className="border border-gray-200 rounded-b-xl overflow-hidden">
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.profilePicture ? (
                          <img
                            src={customer.profilePicture}
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Joined {formatDate(customer.joinDate)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone || "No phone"}
                        </div>
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
                        Rs. {(customer.totalSpent || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.orderCount || 0} orders
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : customer.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : customer.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status || 'N/A'}
                        </span>
                        {customer.currentSubscription && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <PackageIcon className="h-3 w-3" />
                            {customer.currentSubscription.planName || 'Active Plan'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 rounded-md transition-colors"
                          title="View customer details"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowMessageForm(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
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
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customers Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm || activeTab !== "all"
                    ? "No customers match your current search. Try adjusting your search criteria."
                    : "No customers have registered yet. Customers will appear here when they place orders."
                  }
                </p>
                {(searchTerm || activeTab !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveTab("all");
                      loadCustomers();
                    }}
                    className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Profile */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex flex-col items-center">
                    {selectedCustomer.profilePicture ? (
                      <img
                        src={selectedCustomer.profilePicture}
                        alt={selectedCustomer.name}
                        className="h-24 w-24 rounded-full object-cover mb-4"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4">
                        <User className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h4>
                    <p className="text-gray-600 text-sm">Customer ID: {selectedCustomer.id}</p>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.phone || "No phone number"}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className={`text-sm px-2 py-1 rounded ${
                        selectedCustomer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : selectedCustomer.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedCustomer.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCustomer.status || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Joined {getTimeAgo(selectedCustomer.joinDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Customer Stats */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCustomer.subscriptionCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Subscriptions</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCustomer.activeSubscriptions || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Subscriptions</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.orderCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">
                      Rs. {(selectedCustomer.totalSpent || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
                
                {/* Current Subscription */}
                {selectedCustomer.currentSubscription && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-blue-600" />
                      Current Subscription
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedCustomer.currentSubscription.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : selectedCustomer.currentSubscription.status === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCustomer.currentSubscription.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">{selectedCustomer.currentSubscription.planName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {formatDate(selectedCustomer.currentSubscription.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">
                          {selectedCustomer.currentSubscription.endDate
                            ? formatDate(selectedCustomer.currentSubscription.endDate)
                            : 'Ongoing'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Dietary Notes */}
                {selectedCustomer.dietaryNotes && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Dietary Notes
                    </h5>
                    <p className="text-sm text-gray-700">{selectedCustomer.dietaryNotes}</p>
                  </div>
                )}
                
                {/* Message Form */}
                {showMessageForm && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="font-bold text-gray-900 mb-2">Send Message to {selectedCustomer.name}</h5>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setShowMessageForm(false)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedCustomer(selectedCustomer);
                  setShowMessageForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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

export default Customers;