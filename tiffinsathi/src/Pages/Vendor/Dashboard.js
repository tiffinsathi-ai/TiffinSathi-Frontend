import React, { useEffect, useState } from "react";
import { 
  Package, 
  Users, 
  Clock, 
  Truck, 
  BarChart3, 
  RefreshCw,
  ShoppingBag,
  UserCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mock data - temporary until backend is fixed
  const mockData = {
    ordersToday: 8,
    activeSubscriptions: 12,
    totalCustomers: 45,
    pendingOrders: 3,
    todayRevenue: 2850,
    recentOrders: [
      { id: "ORD-001", userName: "John Doe", status: "pending", deliveryTime: "12:30 PM" },
      { id: "ORD-002", userName: "Jane Smith", status: "preparing", deliveryTime: "1:00 PM" },
      { id: "ORD-003", userName: "Robert Johnson", status: "out_for_delivery", deliveryTime: "11:45 AM" },
      { id: "ORD-004", userName: "Sarah Williams", status: "delivered", deliveryTime: "10:30 AM" },
    ],
    recentCustomers: [
      { id: "CUST-001", name: "Alice Johnson", phone: "123-456-7890", totalSpent: 500, totalSubscriptions: 1 },
      { id: "CUST-002", name: "Bob Williams", phone: "987-654-3210", totalSpent: 750, totalSubscriptions: 2 },
      { id: "CUST-003", name: "Charlie Brown", phone: "456-789-0123", totalSpent: 1200, totalSubscriptions: 1 },
    ]
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Enhanced StatCard
  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50"
    };

    const getNavigationPath = () => {
      if (title.includes("Today's Orders") || title.includes("Pending")) return "/vendor/orders";
      if (title.includes("Active Subscriptions")) return "/vendor/subscriptions";
      if (title.includes("Customers")) return "/vendor/customers";
      if (title.includes("Revenue")) return "/vendor/earnings";
      return "/vendor/dashboard";
    };

    return (
      <div 
        className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
        onClick={() => navigate(getNavigationPath())}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
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
        className={`flex items-center gap-2 text-white px-4 py-3 rounded-lg font-medium transition-colors ${colors[color] || colors.blue} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-green-600 mr-2" size={24} />
        <span className="text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Vendor!</h1>
            <p className="opacity-90">Here's what's happening with your business today</p>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-4xl font-bold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="opacity-90 mt-1">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Today's Orders"
          value={mockData.ordersToday}
          icon={ShoppingBag}
          color="blue"
          change="+12% from yesterday"
        />
        <StatCard
          title="Active Subscriptions"
          value={mockData.activeSubscriptions}
          icon={Users}
          color="green"
          change="+5 this week"
        />
        <StatCard
          title="Total Customers"
          value={mockData.totalCustomers}
          icon={UserCheck}
          color="purple"
          change="+3 new this month"
        />
        <StatCard
          title="Pending Orders"
          value={mockData.pendingOrders}
          icon={Clock}
          color="orange"
          change="Requires attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border shadow-sm p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => navigate("/vendor/orders")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {mockData.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                    <Package className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">
                      Order #{order.id}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {order.userName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.deliveryTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Recent Customers</h3>
            <button 
              onClick={() => navigate("/vendor/customers")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {mockData.recentCustomers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">
                      {customer.name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Rs. {(customer.totalSpent).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.totalSubscriptions} subscription(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
            <p className="text-xl md:text-2xl font-bold text-blue-600">{mockData.ordersToday}</p>
            <p className="text-xs md:text-sm text-gray-600">Orders</p>
          </div>
          <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
            <p className="text-xl md:text-2xl font-bold text-green-600">Rs {mockData.todayRevenue}</p>
            <p className="text-xs md:text-sm text-gray-600">Revenue</p>
          </div>
          <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg">
            <p className="text-xl md:text-2xl font-bold text-purple-600">{mockData.activeSubscriptions}</p>
            <p className="text-xs md:text-sm text-gray-600">Active Subs</p>
          </div>
          <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
            <p className="text-xl md:text-2xl font-bold text-orange-600">{mockData.pendingOrders}</p>
            <p className="text-xs md:text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;