// src/Pages/Vendor/Dashboard.js
import React, { useEffect, useState } from "react";
import {
  Package,
  Users,
  Clock,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  Truck,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vendorApi } from "../../helpers/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    ordersToday: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    activeSubscriptions: 0,
    avgRating: 0,
    todayRevenue: 0,
    orderGrowth: 0,
    revenueGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's date for filtering
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Get today's and yesterday's data for growth calculation
      const [todayResponse, yesterdayResponse, customersResponse, subscriptionsResponse, earningsResponse] = await Promise.all([
        vendorApi.getVendorOrders(today),
        vendorApi.getVendorOrders(yesterdayStr),
        vendorApi.getVendorCustomers(),
        vendorApi.getVendorSubscriptions("ACTIVE"),
        vendorApi.getVendorEarnings("30days")
      ]);

      // Process today's orders
      if (todayResponse.ok && todayResponse.data) {
        const todayOrders = Array.isArray(todayResponse.data) ? todayResponse.data : [];
        const pendingOrders = todayOrders.filter(o => 
          o.status === 'PENDING' || o.status === 'pending' || o.status === 'preparing'
        ).length;
        
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Get recent orders (last 5)
        const recentOrdersData = todayOrders
          .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
          .slice(0, 5);
        
        setRecentOrders(recentOrdersData);
        
        // Calculate order growth
        let orderGrowth = 0;
        if (yesterdayResponse.ok && yesterdayResponse.data) {
          const yesterdayOrders = Array.isArray(yesterdayResponse.data) ? yesterdayResponse.data : [];
          orderGrowth = yesterdayOrders.length > 0 
            ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100)
            : 100;
        }

        setDashboardData(prev => ({
          ...prev,
          ordersToday: todayOrders.length,
          pendingOrders,
          todayRevenue,
          orderGrowth
        }));
      }

      // Process customers
      if (customersResponse.ok && customersResponse.data) {
        const customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];
        const recentCust = customers.slice(0, 5).map(customer => ({
          ...customer,
          totalOrders: customer.totalOrders || 0,
          totalSubscriptions: customer.activeSubscriptions || 0
        }));
        
        setRecentCustomers(recentCust);
        setDashboardData(prev => ({
          ...prev,
          totalCustomers: customers.length
        }));
      }

      // Process subscriptions
      if (subscriptionsResponse.ok && subscriptionsResponse.data) {
        const activeSubscriptions = Array.isArray(subscriptionsResponse.data) ? subscriptionsResponse.data : [];
        setDashboardData(prev => ({
          ...prev,
          activeSubscriptions: activeSubscriptions.length
        }));
      }

      // Process earnings and revenue growth
      if (earningsResponse.ok && earningsResponse.data) {
        const payments = Array.isArray(earningsResponse.data) ? earningsResponse.data : [];
        const totalSales = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // Calculate revenue growth (simplified)
        const revenueGrowth = 15; // In real app, calculate from historical data
        
        setDashboardData(prev => ({
          ...prev,
          totalSales,
          revenueGrowth
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Professional StatCard Component
  const StatCard = ({ title, value, icon: Icon, color, trendValue, onClick }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50"
    };

    return (
      <div 
        className={`bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-green-300' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {trendValue !== undefined && (
            <div className={`flex items-center text-sm ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1 font-medium">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
    );
  };

  // ActionButton component
  const ActionButton = ({ icon: Icon, label, onClick, color = "blue" }) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
      orange: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 text-white px-4 py-3 rounded-lg font-medium transition-colors ${colors[color]} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      preparing: "bg-blue-50 text-blue-700 border-blue-200",
      out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      PREPARING: "bg-blue-50 text-blue-700 border-blue-200",
      OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-green-600 mr-2" size={24} />
        <span className="text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="opacity-90">Here's what's happening with your business today</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="opacity-90 mt-1">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Orders"
          value={dashboardData.ordersToday || '0'}
          icon={ShoppingBag}
          color="blue"
          trendValue={dashboardData.orderGrowth}
          onClick={() => navigate("/vendor/orders")}
        />
        <StatCard
          title="Active Subscriptions"
          value={dashboardData.activeSubscriptions || '0'}
          icon={Users}
          color="green"
          onClick={() => navigate("/vendor/subscriptions")}
        />
        <StatCard
          title="Total Customers"
          value={dashboardData.totalCustomers || '0'}
          icon={UserCheck}
          color="purple"
          onClick={() => navigate("/vendor/customers")}
        />
        <StatCard
          title="Pending Orders"
          value={dashboardData.pendingOrders || '0'}
          icon={Clock}
          color="orange"
          onClick={() => navigate("/vendor/orders")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            icon={Package}
            label="View Orders"
            onClick={() => navigate("/vendor/orders")}
            color="blue"
          />
          <ActionButton
            icon={Users}
            label="Manage Customers"
            onClick={() => navigate("/vendor/customers")}
            color="green"
          />
          <ActionButton
            icon={Truck}
            label="Delivery Partners"
            onClick={() => navigate("/vendor/delivery-partners")}
            color="purple"
          />
          <ActionButton
            icon={BarChart3}
            label="View Reports"
            onClick={() => navigate("/vendor/earnings")}
            color="orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => navigate("/vendor/orders")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id || order.orderId} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(order.status)} border`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.orderNumber || order.id}</p>
                    <p className="text-sm text-gray-500">{order.customerName || order.userName || "Customer"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border`}>
                    {formatStatus(order.status)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.deliveryTime || new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
            <button 
              onClick={() => navigate("/vendor/customers")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {recentCustomers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  {customer.profilePicture ? (
                    <img src={customer.profilePicture} alt={customer.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{customer.name || customer.userName || "Customer"}</p>
                    <p className="text-sm text-gray-500">{customer.phone || "No phone"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹ {customer.totalSpent?.toLocaleString() || "0"}</p>
                  <p className="text-xs text-gray-500">{customer.totalSubscriptions || 0} subscriptions</p>
                </div>
              </div>
            ))}
            {recentCustomers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No customers yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{dashboardData.ordersToday || 0}</p>
            <p className="text-sm text-gray-600">Orders</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-2xl font-bold text-green-600">₹{dashboardData.todayRevenue || 0}</p>
            <p className="text-sm text-gray-600">Revenue</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-2xl font-bold text-purple-600">{dashboardData.activeSubscriptions || 0}</p>
            <p className="text-sm text-gray-600">Active Subs</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">{dashboardData.pendingOrders || 0}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;