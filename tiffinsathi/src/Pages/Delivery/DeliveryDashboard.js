/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Filter,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  User,
  ChevronDown,
  ChevronUp,
  Map,
  Home,
  Flag,
  PlayCircle,
  ShieldCheck,
  Award,
  Calendar,
  Mail,
  Clock
} from 'lucide-react';
import { deliveryApi } from '../../helpers/deliveryApi';
import MapModal from '../../Components/Delivery/MapModal'; // Import the fixed MapModal

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryProfile, setDeliveryProfile] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchDeliveryProfile();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (deliveryProfile) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [deliveryProfile]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchDeliveryProfile = async () => {
    try {
      const response = await deliveryApi.getProfile();
      setDeliveryProfile(response.data);
    } catch (error) {
      console.error('Error fetching delivery profile:', error);
      setError('Failed to load delivery profile');
    }
  };

  const fetchOrders = async () => {
    if (!deliveryProfile) return;

    setLoading(true);
    setError('');
    try {
      const [todayResponse, completedResponse] = await Promise.all([
        deliveryApi.getTodaysMyOrders(),
        deliveryApi.getCompletedOrders()
      ]);

      const todayOrders = Array.isArray(todayResponse.data) ? todayResponse.data : [];
      const completed = Array.isArray(completedResponse.data) ? completedResponse.data : [];

      setOrders(todayOrders);

      // Filter active orders
      const active = todayOrders.filter(order =>
        order.status === 'ASSIGNED' ||
        order.status === 'PICKED_UP' ||
        order.status === 'OUT_FOR_DELIVERY' ||
        order.status === 'ARRIVED'
      );

      // Filter completed orders for today
      const completedToday = todayOrders.filter(order =>
        order.status === 'DELIVERED' || order.status === 'COMPLETED'
      );

      const allCompleted = [...completedToday, ...completed];

      // Sort completed orders
      const sortedCompleted = allCompleted.sort((a, b) => {
        const dateA = new Date(a.deliveryDate || a.updatedAt || a.createdAt);
        const dateB = new Date(b.deliveryDate || b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setActiveOrders(active);
      setCompletedOrders(sortedCompleted);

    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders. Please try again.');
      setOrders([]);
      setActiveOrders([]);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const deliveryPersonId = deliveryProfile?.partnerId;
      await deliveryApi.updateOrderStatus(orderId, status, deliveryPersonId);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const pickUpOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'PICKED_UP');
    } catch (error) {
      console.error('Error picking up order:', error);
    }
  };

  const startDelivery = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'OUT_FOR_DELIVERY');
    } catch (error) {
      console.error('Error starting delivery:', error);
    }
  };

  const markArrived = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ARRIVED');
    } catch (error) {
      console.error('Error marking order as arrived:', error);
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'DELIVERED');
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  const openMapModal = (order) => {
    setSelectedOrderForMap(order);
    setShowMapModal(true);
  };

  const callCustomer = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getFilteredOrders = () => {
    let filtered = [];
    switch (activeTab) {
      case 'active':
        filtered = activeOrders;
        break;
      case 'completed':
        filtered = completedOrders;
        break;
      default:
        filtered = [];
    }

    // Apply status filter for active tab
    if (activeTab === 'active' && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter for completed tab
    if (activeTab === 'completed' && dateFilter !== 'all') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.deliveryDate || order.updatedAt || order.createdAt);

        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === today.toDateString();
          case 'week':
            return orderDate >= startOfWeek;
          case 'month':
            return orderDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId?.toString().includes(searchTerm) ||
        order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'ASSIGNED': { label: 'Assigned', color: 'blue', step: 1, action: 'Pick Up' },
      'PICKED_UP': { label: 'Picked Up', color: 'orange', step: 2, action: 'Start Delivery' },
      'OUT_FOR_DELIVERY': { label: 'Out for Delivery', color: 'purple', step: 3, action: 'Mark Arrived' },
      'ARRIVED': { label: 'Arrived', color: 'yellow', step: 4, action: 'Mark Delivered' },
      'DELIVERED': { label: 'Delivered', color: 'green', step: 5, action: 'Delivered' },
      'COMPLETED': { label: 'Completed', color: 'emerald', step: 5, action: 'Completed' }
    };
    return statusMap[status] || { label: status, color: 'gray', step: 0, action: '' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Compact DeliveryProgress with smaller size
  const DeliveryProgress = ({ order }) => {
    const steps = [
      { number: 1, label: 'Assigned', status: 'ASSIGNED', icon: ShieldCheck },
      { number: 2, label: 'Picked Up', status: 'PICKED_UP', icon: Package },
      { number: 3, label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY', icon: Truck },
      { number: 4, label: 'Arrived', status: 'ARRIVED', icon: Flag },
      { number: 5, label: 'Delivered', status: 'DELIVERED', icon: CheckCircle }
    ];

    const currentStep = getStatusInfo(order.status).step;
    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
      <div className="mb-4">
        {/* Compact progress bar with percentage */}
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-medium text-gray-600">Delivery Progress</div>
          <div className="text-xs font-semibold text-blue-600">{Math.round(progressPercentage)}%</div>
        </div>
        
        {/* Smaller progress bar line */}
        <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Smaller step indicators */}
        <div className="flex justify-between relative">
          {/* Connecting line in background */}
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep >= step.number;
            const isCurrent = currentStep === step.number;
            
            return (
              <div key={step.number} className="flex flex-col items-center relative z-10">
                <div className={`flex flex-col items-center ${isCompleted ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : isCurrent
                        ? 'bg-orange-100 border-orange-500 text-orange-600'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : isCurrent ? (
                      <Icon className="h-2.5 w-2.5" />
                    ) : (
                      <Icon className="h-2.5 w-2.5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-center font-medium max-w-16 truncate">
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Even more compact version for expanded view
  const CompactDeliveryProgress = ({ order }) => {
    const steps = [
      { status: 'ASSIGNED', label: 'A' },
      { status: 'PICKED_UP', label: 'PU' },
      { status: 'OUT_FOR_DELIVERY', label: 'OFD' },
      { status: 'ARRIVED', label: 'AR' },
      { status: 'DELIVERED', label: 'D' }
    ];

    const currentStep = getStatusInfo(order.status).step;
    const progressPercentage = ((currentStep - 1) / 4) * 100;

    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs text-gray-600">Progress</div>
          <div className="text-xs font-semibold text-blue-600">{Math.round(progressPercentage)}%</div>
        </div>
        
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-500 to-green-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-1">
          {steps.map((step, index) => {
            const isCompleted = currentStep >= (index + 1);
            return (
              <div 
                key={step.status} 
                className={`text-xs ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'}`}
              >
                {step.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Completed Order Progress - Compact version
  const CompletedOrderProgress = ({ order }) => {
    const steps = [
      { label: 'A' },
      { label: 'PU' },
      { label: 'OFD' },
      { label: 'AR' },
      { label: 'D' }
    ];

    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs text-green-600 font-medium flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </div>
          <div className="text-xs font-semibold text-green-600">100%</div>
        </div>
        
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute h-full bg-green-500 w-full" />
        </div>
        
        <div className="flex justify-between mt-1">
          {steps.map((step, index) => (
            <div key={index} className="text-xs text-green-600 font-medium">
              {step.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
              <p className="text-gray-600">Manage your deliveries efficiently</p>
              {deliveryProfile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{deliveryProfile.name} • {deliveryProfile.vehicleInfo || 'Delivery Partner'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64"
                />
              </div>
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-blue-100 text-blue-600 mr-3">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-green-100 text-green-600 mr-3">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">{completedOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-purple-100 text-purple-600 mr-3">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Today</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'active', label: 'Active Orders', count: activeOrders.length },
                  { id: 'completed', label: 'Completed', count: completedOrders.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setDateFilter('all');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {activeTab === 'active' && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="ARRIVED">Arrived</option>
                  </select>
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No {activeTab} orders found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* For completed orders, group by date */}
                {activeTab === 'completed' && (
                  (() => {
                    const groupedOrders = {};
                    filteredOrders.forEach(order => {
                      const dateKey = formatDate(order.deliveryDate);
                      if (!groupedOrders[dateKey]) {
                        groupedOrders[dateKey] = [];
                      }
                      groupedOrders[dateKey].push(order);
                    });

                    return Object.entries(groupedOrders).map(([date, dateOrders]) => (
                      <div key={date} className="mb-8">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                          <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                            {dateOrders.length} {dateOrders.length === 1 ? 'order' : 'orders'}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {dateOrders.map((order) => (
                            <CompletedOrderCard
                              key={order.orderId}
                              order={order}
                              expandedOrder={expandedOrder}
                              toggleOrderExpand={toggleOrderExpand}
                              openMapModal={openMapModal}
                              getStatusInfo={getStatusInfo}
                              formatTime={formatTime}
                              CompletedOrderProgress={CompletedOrderProgress}
                            />
                          ))}
                        </div>
                      </div>
                    ));
                  })()
                )}

                {/* For active tab */}
                {activeTab === 'active' && (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.orderId} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order.orderId}</h3>
                              <p className="text-sm text-gray-600">
                                {order.deliveryDate} • {order.preferredDeliveryTime || 'Anytime'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                getStatusInfo(order.status).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                  getStatusInfo(order.status).color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                    getStatusInfo(order.status).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                              }`}>
                              {getStatusInfo(order.status).label}
                            </span>
                            <button
                              onClick={() => toggleOrderExpand(order.orderId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedOrder === order.orderId ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Compact Progress Bar */}
                        <div className="mb-4">
                          <DeliveryProgress order={order} />
                        </div>

                        {/* Customer Info in format: name: john */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-600 mr-2">Name:</span>
                                <p className="font-medium text-gray-900">
                                  {order.customer?.userName || order.customer?.name || 'Customer'}
                                </p>
                              </div>
                              {order.customer?.phoneNumber && (
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-600 mr-2">Phone:</span>
                                  <p className="text-sm text-gray-600">{order.customer.phoneNumber}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.customer?.phoneNumber && (
                              <>
                                <button
                                  onClick={() => callCustomer(order.customer.phoneNumber)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Call Customer"
                                >
                                  <Phone className="h-4 w-4" />
                                </button>
                                <a
                                  href={`https://wa.me/${order.customer.phoneNumber.replace('+', '').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {order.status === 'ASSIGNED' && (
                            <button
                              onClick={() => pickUpOrder(order.orderId)}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Package className="h-4 w-4" />
                              Pick Up Order
                            </button>
                          )}

                          {order.status === 'PICKED_UP' && (
                            <button
                              onClick={() => startDelivery(order.orderId)}
                              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Start Delivery
                            </button>
                          )}

                          {order.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={() => markArrived(order.orderId)}
                              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                              <Flag className="h-4 w-4" />
                              Mark Arrived
                            </button>
                          )}

                          {order.status === 'ARRIVED' && (
                            <button
                              onClick={() => markDelivered(order.orderId)}
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Delivered
                            </button>
                          )}

                          <button
                            onClick={() => openMapModal(order)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <Map className="h-4 w-4" />
                            View Map
                          </button>
                        </div>

                        {expandedOrder === order.orderId && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            {/* Super compact progress bar for expanded view */}
                            <CompactDeliveryProgress order={order} />
                            
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
                                <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                              </div>
                            </div>

                            {order.orderMeals?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-2">Order Items</p>
                                <div className="space-y-2">
                                  {order.orderMeals.map((meal, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                                      <div>
                                        <p className="font-medium text-gray-900">{meal.mealSetName}</p>
                                        <p className="text-sm text-gray-600 capitalize">{meal.mealSetType?.toLowerCase()}</p>
                                      </div>
                                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm font-medium">
                                        Qty: {meal.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {order.specialInstructions && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</p>
                                <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        order={selectedOrderForMap}
        userLocation={userLocation}
      />
    </div>
  );
};

// Separate component for completed order card with formatted data
const CompletedOrderCard = ({ 
  order, 
  expandedOrder, 
  toggleOrderExpand, 
  openMapModal, 
  getStatusInfo, 
  formatTime,
  CompletedOrderProgress 
}) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Order #{order.orderId}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{order.preferredDeliveryTime || 'Anytime'}</span>
              {order.actualDeliveryTime && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>Delivered at {formatTime(order.actualDeliveryTime)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).color === 'green' ? 'bg-green-100 text-green-800' :
              'bg-emerald-100 text-emerald-800'
            }`}>
            {getStatusInfo(order.status).label}
          </span>
          <button
            onClick={() => toggleOrderExpand(order.orderId)}
            className="text-gray-400 hover:text-gray-600"
          >
            {expandedOrder === order.orderId ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Compact Completed Order Progress */}
      <CompletedOrderProgress order={order} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Name:</span>
              <p className="font-medium text-gray-900">{order.customer?.userName || order.customer?.name || 'Customer'}</p>
            </div>
            {order.customer?.phoneNumber && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Phone:</span>
                <p className="text-sm text-gray-600">{order.customer.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openMapModal(order)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <Map className="h-3 w-3" />
            View Map
          </button>
        </div>
      </div>

      {expandedOrder === order.orderId && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
            </div>
          </div>

          {order.orderMeals?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Order Items</p>
              <div className="space-y-2">
                {order.orderMeals.map((meal, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900">{meal.mealSetName}</p>
                      <p className="text-sm text-gray-600 capitalize">{meal.mealSetType?.toLowerCase()}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm font-medium">
                      Qty: {meal.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.specialInstructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</p>
              <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;