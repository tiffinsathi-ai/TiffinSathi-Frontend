// src/Pages/Vendor/Customers.js
import React, { useState, useEffect } from "react";
import { readData } from "../../helpers/storage";
import { 
  Search, 
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  Star,
  TrendingUp,
  MoreVertical,
  MessageCircle,
  Clock,
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
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // Message form state
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, searchPhone, activeTab, customers]);

  const loadCustomers = () => {
    setLoading(true);
    const data = readData();
    
    const enhancedCustomers = (data.customers || []).map(customer => {
      const customerOrders = (data.orders || []).filter(order => order.userId === customer.id);
      const customerSubscriptions = (data.subscriptions || []).filter(sub => sub.userId === customer.id);
      const customerReviews = (data.reviews || []).filter(review => review.userId === customer.id);
      
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
      const avgRating = customerReviews.length > 0 
        ? customerReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / customerReviews.length
        : 0;

      return {
        ...customer,
        orderCount: customerOrders.length,
        subscriptionCount: customerSubscriptions.length,
        activeSubscriptions: customerSubscriptions.filter(s => s.status === 'active').length,
        reviewCount: customerReviews.length,
        totalSpent,
        avgOrderValue,
        avgRating,
        lastOrder: customerOrders.length > 0 
          ? customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null,
        currentSubscription: customerSubscriptions.find(s => s.status === 'active') || null,
        status: customerOrders.length > 0 ? "active" : "new",
        joinDate: customer.createdAt || customer.joinDate
      };
    });

    setCustomers(enhancedCustomers);
    setLoading(false);
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Phone filter
    if (searchPhone) {
      filtered = filtered.filter(customer =>
        customer.phone && customer.phone.includes(searchPhone)
      );
    }

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter(customer => customer.status === activeTab);
    }

    setFilteredCustomers(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterCustomers();
  };

  const viewCustomerDetails = (customer) => {
    const data = readData();
    const customerOrders = (data.orders || []).filter(order => order.userId === customer.id);
    const customerSubscriptions = (data.subscriptions || []).filter(sub => sub.userId === customer.id);
    const customerReviews = (data.reviews || []).filter(review => review.userId === customer.id);

    setSelectedCustomer({
      ...customer,
      orders: customerOrders,
      subscriptions: customerSubscriptions,
      reviews: customerReviews
    });
    setShowCustomerModal(true);
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

  const getCustomerStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      new: "bg-blue-100 text-blue-800 border-blue-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  // Stats Card Component
  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      emerald: "text-emerald-600 bg-emerald-50",
      purple: "text-purple-600 bg-purple-50"
    };

    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">Manage all customers who have subscribed to your services</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Total Customers: {customers.length}
          </span>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter customer name..."
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter phone number..."
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
            {(searchTerm || searchPhone) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSearchPhone("");
                  loadCustomers();
                }}
                className="ml-2 text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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

        {/* Customer Table */}
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
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {customer.profilePicture ? (
                        <img
                          src={customer.profilePicture}
                          alt={customer.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone || "N/A"}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : customer.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status || 'N/A'}
                    </span>
                    {customer.currentSubscription && (
                      <div className="mt-1 text-xs text-gray-500">
                        {customer.currentSubscription.status}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowMessageForm(true);
                        }}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1 ml-2"
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
              <p className="text-gray-600">
                {searchTerm || searchPhone || activeTab !== "all"
                  ? "No customers match your current filters. Try adjusting your search criteria."
                  : "No customers have registered yet. Customers will appear here when they place orders."
                }
              </p>
            </div>
          )}
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
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Profile */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    {selectedCustomer.profilePicture ? (
                      <img
                        src={selectedCustomer.profilePicture}
                        alt={selectedCustomer.name}
                        className="h-24 w-24 rounded-full object-cover mb-4"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <User className="h-12 w-12 text-gray-500" />
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h4>
                    <p className="text-gray-600">Customer ID: {selectedCustomer.id}</p>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className={`text-sm px-2 py-1 rounded ${
                        selectedCustomer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : selectedCustomer.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCustomer.status || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Joined {getTimeAgo(selectedCustomer.joinDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Customer Stats */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCustomer.subscriptionCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Subscriptions</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCustomer.activeSubscriptions || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Subscriptions</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.orderCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      Rs. {(selectedCustomer.totalSpent || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
                
                {/* Current Subscription */}
                {selectedCustomer.currentSubscription && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <PackageIcon className="h-4 w-4" />
                      Current Subscription
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedCustomer.currentSubscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedCustomer.currentSubscription.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Plan:</span>
                        <span className="ml-2 font-medium">{selectedCustomer.currentSubscription.planName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <span className="ml-2">
                          {formatDate(selectedCustomer.currentSubscription.startDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <span className="ml-2">
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
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-2">Dietary Notes</h5>
                    <p className="text-sm text-gray-700">{selectedCustomer.dietaryNotes}</p>
                  </div>
                )}
                
                {/* Message Form */}
                {showMessageForm && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-2">Send Message to {selectedCustomer.name}</h5>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setShowMessageForm(false)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>
              <button
                onClick={() => setShowCustomerModal(false)}
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

export default Customers;