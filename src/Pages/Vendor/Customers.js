// src/Pages/Vendor/Customers.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
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
  Clock
} from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Subscription form state
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    planName: "",
    billingCycle: "30 days",
    pricePerCycle: ""
  });

  // NEW: message form state
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState("");

  // NEW: full orders view toggle
  const [showOrdersView, setShowOrdersView] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, activeTab, customers]);

  const loadCustomers = () => {
    const data = readData();
    
    // Enhance customers with additional data
    const enhancedCustomers = (data.customers || []).map(customer => {
      const customerOrders = (data.orders || []).filter(order => order.userId === customer.id);
      const customerSubscriptions = (data.subscriptions || []).filter(sub => sub.userId === customer.id);
      const customerReviews = (data.reviews || []).filter(review => review.userId === customer.id);
      
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
      const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
      const avgRating = customerReviews.length > 0 
        ? customerReviews.reduce((sum, review) => sum + review.rating, 0) / customerReviews.length
        : 0;

      return {
        ...customer,
        orderCount: customerOrders.length,
        subscriptionCount: customerSubscriptions.length,
        reviewCount: customerReviews.length,
        totalSpent,
        avgOrderValue,
        avgRating,
        lastOrder: customerOrders.length > 0 
          ? customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null,
        status: customerOrders.length > 0 ? "active" : "new"
      };
    });

    setCustomers(enhancedCustomers);
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter(customer => customer.status === activeTab);
    }

    setFilteredCustomers(filtered);
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

    // reset all inline forms/toggles when opening modal
    setShowSubscriptionForm(false);
    setSubscriptionForm({
      planName: "",
      billingCycle: "30 days",
      pricePerCycle: ""
    });
    setShowMessageForm(false);
    setMessageText("");
    setShowOrdersView(false);
  };

  const getCustomerStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      new: "bg-blue-100 text-blue-800",
      inactive: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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

  // Send message (now uses inline form)
  const handleSendMessage = () => {
    if (!selectedCustomer) return;
    if (!messageText.trim()) {
      alert("Please enter a message before sending.");
      return;
    }
    alert(`Message sent to ${selectedCustomer.name}: "${messageText.trim()}"`);
    console.log(`Message to ${selectedCustomer.email}: ${messageText.trim()}`);
    setMessageText("");
    setShowMessageForm(false);
  };

  // View all orders: now just toggles the full orders view inside modal
  const handleViewAllOrders = () => {
    setShowOrdersView(true);
  };

  // Open subscription form
  const openSubscriptionForm = () => {
    setShowSubscriptionForm(true);
    setSubscriptionForm({
      planName: "",
      billingCycle: "30 days",
      pricePerCycle: ""
    });
  };

  // Submit subscription form
  const submitSubscriptionForm = () => {
    if (!selectedCustomer) return;

    const { planName, billingCycle, pricePerCycle } = subscriptionForm;

    if (!planName.trim()) {
      alert("Plan name is required.");
      return;
    }

    if (!billingCycle.trim()) {
      alert("Billing cycle is required.");
      return;
    }

    const price = parseFloat(pricePerCycle || "0");
    if (!price || Number.isNaN(price) || price <= 0) {
      alert("Please enter a valid price per cycle.");
      return;
    }

    const data = readData();
    const existingSubs = data.subscriptions || [];

    const newSubscription = {
      id: "sub_" + Date.now(),
      userId: selectedCustomer.id,
      userName: selectedCustomer.name,
      planName: planName.trim(),
      tiffinId: null,
      tiffinName: null,
      billingCycle: billingCycle.trim(),
      pricePerCycle: price,
      status: "active",
      startDate: new Date().toISOString(),
      nextBillingDate: null,
      endDate: null,
      totalBilled: 0,
      createdAt: new Date().toISOString()
    };

    data.subscriptions = [...existingSubs, newSubscription];
    writeData(data);

    alert(`Subscription created for ${selectedCustomer.name}: ${planName.trim()}`);

    setShowSubscriptionForm(false);
    setSubscriptionForm({
      planName: "",
      billingCycle: "30 days",
      pricePerCycle: ""
    });

    // reload customers so subscriptionCount updates
    loadCustomers();
  };

  const handleContactCustomer = (customer) => {
    const contactMessage = prompt(
      `Contact ${customer.name} via:\nCall: ${customer.phone}\nEmail: ${customer.email}\n\nEnter your message:`,
      "Hello! We have a special offer for you..."
    );
    if (contactMessage && contactMessage.trim()) {
      alert(`Contacting ${customer.name} with your message`);
      console.log(`Contacted ${customer.name}: ${contactMessage}`);
    }
  };

  const tabs = [
    { id: "all", label: "All Customers", count: customers.length },
    { id: "active", label: "Active", count: customers.filter(c => c.status === "active").length },
    { id: "new", label: "New", count: customers.filter(c => c.status === "new").length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">Manage your customer relationships and insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl.shadow-sm border border-gray-100">
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

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={14} className="mr-2" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2" />
                    <span>Joined {getTimeAgo(customer.joinDate)}</span>
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{customer.orderCount}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">Rs {customer.totalSpent}</p>
                    <p className="text-xs text-gray-600">Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{customer.avgRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                </div>

                {/* Last Order */}
                {customer.lastOrder && (
                  <div className="mb-4 p-3 bg.white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Last Order</p>
                        <p className="text-gray-600">{customer.lastOrder.items[0].name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">Rs {customer.lastOrder.total}</p>
                        <p className="text-gray-500 text-xs">{getTimeAgo(customer.lastOrder.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewCustomerDetails(customer)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleContactCustomer(customer)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    title="Contact customer"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center.mx-auto.mb-4">
                <User size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-gray-600">
                {searchTerm || activeTab !== "all"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex.items-center.justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-gray-600">Customer since {getTimeAgo(selectedCustomer.joinDate)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setShowSubscriptionForm(false);
                    setShowMessageForm(false);
                    setShowOrdersView(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Clock size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                      {selectedCustomer.phone && (
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium">{selectedCustomer.phone}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Customer ID</p>
                        <p className="font-medium">{selectedCustomer.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Orders section: either recent or all orders */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">
                        {showOrdersView ? "All Orders" : "Recent Orders"}
                      </h4>
                      {selectedCustomer.orders.length > 0 && (
                        <button
                          onClick={() => setShowOrdersView(prev => !prev)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {showOrdersView ? "Show Recent Only" : "View All Orders"}
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {(showOrdersView ? selectedCustomer.orders : selectedCustomer.orders.slice(0, 5)).map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-600">
                              {order.items.map(item => item.name).join(", ")}
                            </p>
                            <p className="text-xs text-gray-500">{getTimeAgo(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">Rs {order.total}</p>
                            <span className={`inline-flex.items-center px-2 py-1 rounded-full text-xs font-medium ${getCustomerStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {selectedCustomer.orders.length === 0 && (
                        <p className="text-gray-600 text-center.py-4">No orders yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Stats + Actions */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Customer Statistics</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-bold">{selectedCustomer.orderCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Subscriptions</span>
                        <span className="font-bold">{selectedCustomer.subscriptionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Spent</span>
                        <span className="font-bold">Rs {selectedCustomer.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Rating</span>
                        <span className="font-bold flex items-center">
                          <Star size={14} className="text-yellow-400 mr-1" />
                          {selectedCustomer.avgRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reviews Given</span>
                        <span className="font-bold">{selectedCustomer.reviewCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions + Forms */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-2 mb-4">
                      <button 
                        onClick={() => {
                          setShowMessageForm(true);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700.transition-colors"
                      >
                        Send Message
                      </button>
                      <button 
                        onClick={handleViewAllOrders}
                        className="w-full px-4 py-2 border border-gray-300.text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50.transition-colors"
                      >
                        View All Orders
                      </button>
                      <button 
                        onClick={openSubscriptionForm}
                        className="w-full px-4 py-2 border border-gray-300.text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50.transition-colors"
                      >
                        Create Subscription
                      </button>
                    </div>

                    {/* Message form */}
                    {showMessageForm && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          Message {selectedCustomer.name}
                        </h5>
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setShowMessageForm(false);
                              setMessageText("");
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50.transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendMessage}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700.transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Subscription form */}
                    {showSubscriptionForm && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">
                          New Subscription for {selectedCustomer.name}
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Plan Name
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-lg px-3.py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Premium Veg Thali"
                              value={subscriptionForm.planName}
                              onChange={(e) =>
                                setSubscriptionForm({
                                  ...subscriptionForm,
                                  planName: e.target.value
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Billing Cycle
                            </label>
                            <select
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={subscriptionForm.billingCycle}
                              onChange={(e) =>
                                setSubscriptionForm({
                                  ...subscriptionForm,
                                  billingCycle: e.target.value
                                })
                              }
                            >
                              <option value="7 days">7 days</option>
                              <option value="15 days">15 days</option>
                              <option value="30 days">30 days</option>
                              <option value="one-time">One-time</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Price per Cycle (Rs)
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="3000"
                              value={subscriptionForm.pricePerCycle}
                              onChange={(e) =>
                                setSubscriptionForm({
                                  ...subscriptionForm,
                                  pricePerCycle: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={() => {
                                setShowSubscriptionForm(false);
                                setSubscriptionForm({
                                  planName: "",
                                  billingCycle: "30 days",
                                  pricePerCycle: ""
                                });
                              }}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50.transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={submitSubscriptionForm}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700.transition-colors"
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3.mt-6.pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setShowSubscriptionForm(false);
                    setShowMessageForm(false);
                    setShowOrdersView(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50.transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;