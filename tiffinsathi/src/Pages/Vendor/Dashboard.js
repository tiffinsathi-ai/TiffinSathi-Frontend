// src/Pages/Vendor/Dashboard.js
import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  Users,
  Star,
  AlertCircle,
  Calendar,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  UserCheck,
  Clock,
  Truck,
  BarChart3,
  MessageSquare,
  Home,
  ChefHat,
  ShoppingBag,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { readData } from "../../helpers/storage";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    const data = readData();
    
    // Calculate metrics
    const today = new Date().toDateString();
    const ordersToday = data.orders.filter(o => 
      new Date(o.createdAt).toDateString() === today
    );
    
    const totalSales = data.transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const pendingOrders = ordersToday.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const activeSubscriptions = data.subscriptions?.filter(s => s.status === 'active').length || 0;
    const avgRating = data.reviews?.length > 0 
      ? (data.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / data.reviews.length).toFixed(1)
      : "0.0";

    // Calculate recent customers (last 5)
    const recentCust = data.customers?.slice(0, 5).map(customer => {
      const customerOrders = data.orders?.filter(o => o.userId === customer.id) || [];
      const customerSubscriptions = data.subscriptions?.filter(s => s.userId === customer.id) || [];
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        ...customer,
        totalSpent,
        totalSubscriptions: customerSubscriptions.length,
        totalOrders: customerOrders.length
      };
    }) || [];

    setDashboardData({
      totalSales,
      ordersToday: ordersToday.length,
      totalCustomers: data.customers?.length || 0,
      pendingOrders,
      activeSubscriptions,
      avgRating,
      totalOrders: data.orders?.length || 0,
      todayRevenue: ordersToday.reduce((sum, o) => sum + (o.total || 0), 0)
    });
    
    setRecentOrders(ordersToday.slice(0, 5));
    setRecentCustomers(recentCust);
    setLoading(false);
  };

  // Enhanced StatCard from inspirational code
  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50"
    };

    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
        if (title.includes("Today's Orders") || title.includes("Pending")) navigate("/vendor/orders");
        if (title.includes("Active Subscriptions")) navigate("/vendor/subscriptions");
        if (title.includes("Customers")) navigate("/vendor/customers");
        if (title.includes("Revenue")) navigate("/vendor/earnings");
      }}>
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

  // ActionButton component from inspirational code
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
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const data = readData();
    const updatedOrders = data.orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    data.orders = updatedOrders;
    // writeData(data); // Uncomment when you have writeData function
    loadDashboardData();
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
            <h1 className="text-3xl font-bold mb-2">Welcome back, Vendor!</h1>
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
          change="+12% from yesterday"
        />
        <StatCard
          title="Active Subscriptions"
          value={dashboardData.activeSubscriptions || '0'}
          icon={Users}
          color="green"
          change="+5 this week"
        />
        <StatCard
          title="Total Customers"
          value={dashboardData.totalCustomers || '0'}
          icon={UserCheck}
          color="purple"
          change="+3 new this month"
        />
        <StatCard
          title="Pending Orders"
          value={dashboardData.pendingOrders || '0'}
          icon={Clock}
          color="orange"
          change="Requires attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
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
            onClick={() => navigate("/vendor/analytics")}
            color="orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.userName || "Customer"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{order.deliveryTime || "No time specified"}</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
              <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  {customer.profilePicture ? (
                    <img src={customer.profilePicture} alt={customer.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.phone || "No phone"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Rs. {customer.totalSpent?.toLocaleString() || "0"}</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{dashboardData.ordersToday || 0}</p>
            <p className="text-sm text-gray-600">Orders</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">Rs {dashboardData.todayRevenue || 0}</p>
            <p className="text-sm text-gray-600">Revenue</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{dashboardData.activeSubscriptions || 0}</p>
            <p className="text-sm text-gray-600">Active Subs</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{dashboardData.pendingOrders || 0}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;