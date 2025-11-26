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
} from "lucide-react";
import { readData, writeData } from "../../helpers/storage";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Remove activeTab since it's not used
  // const [activeTab, setActiveTab] = useState("overview");

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
    
    const totalSales = data.transactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingOrders = data.orders.filter(o => o.status === 'pending').length;
    const activeSubscriptions = data.subscriptions?.filter(s => s.status === 'active').length || 0;
    const avgRating = data.reviews.length > 0 
      ? (data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length).toFixed(1)
      : "0.0";

    setDashboardData({
      totalSales,
      ordersToday: ordersToday.length,
      totalCustomers: data.customers.length,
      pendingOrders,
      activeSubscriptions,
      avgRating,
      totalOrders: data.orders.length
    });
    
    setRecentOrders(data.orders.slice(0, 5));
    setLoading(false);
  };

  const StatCard = ({ icon, label, value, change, changeType, onClick }) => (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const data = readData();
    const updatedOrders = data.orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    data.orders = updatedOrders;
    writeData(data);
    loadDashboardData(); // Refresh data
  };

  const QuickAction = ({ icon, label, description, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className={`p-4 border border-gray-200 rounded-lg text-left hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 w-full`}
    >
      <div className={`w-10 h-10 rounded-full bg-${color}-50 flex items-center justify-center mb-3`}>
        {React.cloneElement(icon, { className: `text-${color}-600`, size: 20 })}
      </div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
  );

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h2>
          <p className="text-gray-600">Overview of your business performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Total Revenue"
          value={`Rs ${dashboardData.totalSales?.toLocaleString() || '0'}`}
          change="+12.5% from last month"
          changeType="positive"
          onClick={() => window.location.href = '/vendor/earnings'}
        />
        <StatCard
          icon={<ShoppingCart size={24} />}
          label="Orders Today"
          value={dashboardData.ordersToday || '0'}
          change={`${dashboardData.pendingOrders || 0} pending`}
          changeType="neutral"
          onClick={() => window.location.href = '/vendor/orders'}
        />
        <StatCard
          icon={<Users size={24} />}
          label="Active Customers"
          value={dashboardData.totalCustomers || '0'}
          change={`${dashboardData.activeSubscriptions || 0} active subscriptions`}
          changeType="positive"
          onClick={() => window.location.href = '/vendor/customers'}
        />
        <StatCard
          icon={<Star size={24} />}
          label="Average Rating"
          value={dashboardData.avgRating || '0.0'}
          change="Based on customer reviews"
          changeType="neutral"
          onClick={() => window.location.href = '/vendor/reviews'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Orders
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Package size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.userName}</p>
                    <p className="text-sm text-gray-500">
                      {order.items?.map(item => item.name).join(', ') || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    Rs {order.total}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers place them</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <QuickAction
                icon={<Package size={20} />}
                label="Add New Meal Plan"
                description="Create a new tiffin meal plan"
                color="green"
                onClick={() => window.location.href = '/vendor/tiffins'}
              />
              <QuickAction
                icon={<Users size={20} />}
                label="Manage Customers"
                description="View and manage customer subscriptions"
                color="blue"
                onClick={() => window.location.href = '/vendor/customers'}
              />
              <QuickAction
                icon={<DollarSign size={20} />}
                label="View Earnings"
                description="Check your revenue and payments"
                color="purple"
                onClick={() => window.location.href = '/vendor/earnings'}
              />
              <QuickAction
                icon={<AlertCircle size={20} />}
                label="Business Reports"
                description="Generate performance reports"
                color="orange"
                onClick={() => window.location.href = '/vendor/analytics'}
              />
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Completion Rate</span>
                <span className="text-sm font-semibold text-green-600">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Preparation Time</span>
                <span className="text-sm font-semibold text-blue-600">32 mins</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="text-sm font-semibold text-yellow-600">4.6/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Repeat Customers</span>
                <span className="text-sm font-semibold text-purple-600">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentOrders.slice(0, 3).map((order, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                order.status === 'delivered' ? 'bg-green-500' : 
                order.status === 'preparing' ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New order from <span className="text-blue-600">{order.userName}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {order.items?.map(item => item.name).join(', ')} • {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;